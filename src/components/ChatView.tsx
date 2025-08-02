// // src/components/ChatView.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { chatApi, ChatRoom, ChatMessage } from '@/lib/api';
// import { useAuth } from '@/contexts/AuthContext';
// import { MessageCircle, Send, Plus, X, Phone, Video } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Skeleton } from '@/components/ui/skeleton';

// export const ChatView = () => {
//   const { user } = useAuth();
//   const queryClient = useQueryClient();
//   const [selectedChat, setSelectedChat] = useState<string | null>(null);
//   const [message, setMessage] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const wsRef = useRef<WebSocket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
  
//   // A ref to store the temporary ID of a message being sent
//   const optimisticIdRef = useRef<string | null>(null);

//   const { data: chatRooms = [], isLoading: isLoadingRooms } = useQuery<ChatRoom[]>({
//     queryKey: ['chatRooms'],
//     queryFn: chatApi.getRooms,
//   });

//   const { data: messages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
//     queryKey: ['chatMessages', selectedChat],
//     queryFn: () => (selectedChat ? chatApi.getMessages(selectedChat) : Promise.resolve([])),
//     enabled: !!selectedChat,
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('auth_token');
//     if (!token) return;

//     const connectWebSocket = () => {
//       const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
//       wsRef.current = ws;

//       ws.onopen = () => setIsConnected(true);
//       ws.onclose = () => {
//         setIsConnected(false);
//         setTimeout(connectWebSocket, 5000);
//       };
//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         ws.close();
//       };

//       ws.onmessage = (event) => {
//         try {
//           const newMessage: ChatMessage = JSON.parse(event.data);

//           if (newMessage.type === 'message') {
//             queryClient.setQueryData(
//               ['chatMessages', newMessage.chat_room_id],
//               (oldData: ChatMessage[] = []) => {
//                 // Check if this is the real version of an optimistic message
//                 if (optimisticIdRef.current && newMessage.sender_id === user?.id) {
//                   // Replace the temporary message with the real one from the server
//                   optimisticIdRef.current = null; // Clear the ref
//                   return oldData.map(m => m.id === optimisticIdRef.current ? newMessage : m);
//                 }
//                 // If it's a new message from someone else, just add it
//                 if (!oldData.some(m => m.id === newMessage.id)) {
//                   return [...oldData, newMessage];
//                 }
//                 return oldData;
//               }
//             );

//             queryClient.setQueryData(
//               ['chatRooms'],
//               (oldRooms: ChatRoom[] = []) => oldRooms.map(room =>
//                 room.id === newMessage.chat_room_id
//                   ? { ...room, lastMessage: newMessage.content, lastMessageTime: newMessage.timestamp }
//                   : room
//               )
//             );
//           }
//         } catch (error) {
//           console.error('Error parsing WebSocket message:', error);
//         }
//       };
//     };

//     connectWebSocket();
//     return () => wsRef.current?.close();
//   }, [queryClient, user?.id]); // Added user.id to dependency array for robustness

//   const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   useEffect(scrollToBottom, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || !selectedChat) return;
    
//     // Create a unique temporary ID for this optimistic message
//     const tempId = `optimistic-${Date.now()}`;
//     optimisticIdRef.current = tempId;

//     const optimisticMessage: ChatMessage = {
//       id: tempId,
//       chat_room_id: selectedChat,
//       content: message,
//       sender_id: user!.id,
//       timestamp: new Date().toISOString(),
//     };

//     queryClient.setQueryData(['chatMessages', selectedChat], (old: ChatMessage[] = []) => [...old, optimisticMessage]);

//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify({
//         type: 'message',
//         chatId: selectedChat,
//         text: message,
//       }));
//     }
    
//     setMessage('');
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };
  
//   const createNewChat = async () => {
//       const chatName = prompt("Enter a name for the new chat:");
//       if (chatName) {
//           await chatApi.createRoom({ name: chatName, participants: [] });
//           queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
//       }
//   };

//   const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//   return (
//     <div className="flex h-[calc(100vh-140px)] gap-6">
//       <div className="w-80 flex flex-col">
//         <Card className="flex-1">
//           <CardHeader className="pb-3">
//             <div className="flex items-center justify-between">
//               <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Chats</CardTitle>
//               <div className="flex items-center gap-2">
//                 <Badge variant={isConnected ? 'success' : 'destructive'} className="text-xs">{isConnected ? 'Live' : 'Offline'}</Badge>
//                 <Button size="sm" variant="outline" onClick={createNewChat}><Plus className="h-4 w-4" /></Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="p-0">
//             <ScrollArea className="h-[calc(100vh-220px)]">
//               {isLoadingRooms ? (
//                 <div className="space-y-2 p-4 pt-0">
//                     <Skeleton className="h-16 w-full" />
//                     <Skeleton className="h-16 w-full" />
//                 </div>
//               ) : (
//                 <div className="space-y-1 p-4 pt-0">
//                   {chatRooms.map((chat) => (
//                     <div key={chat.id} onClick={() => setSelectedChat(chat.id)}
//                       className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedChat === chat.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
//                       <Avatar><AvatarFallback>{chat.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="text-sm font-medium truncate">{chat.name}</h4>
//                         <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || 'No messages'}</p>
//                       </div>
//                       {chat.unread_count > 0 && <Badge variant="destructive">{chat.unread_count}</Badge>}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </ScrollArea>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="flex-1 flex flex-col">
//         {selectedChat ? (
//           <>
//             <CardHeader className="pb-3 border-b">
//               {/* Card header content */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <Avatar><AvatarFallback>{chatRooms.find(c => c.id === selectedChat)?.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
//                     <div>
//                         <h3 className="font-semibold">{chatRooms.find(c => c.id === selectedChat)?.name}</h3>
//                         <p className="text-xs text-muted-foreground">{isConnected ? 'Online' : 'Offline'}</p>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <Button size="sm" variant="ghost"><Phone className="h-4 w-4" /></Button>
//                     <Button size="sm" variant="ghost"><Video className="h-4 w-4" /></Button>
//                     <Button size="sm" variant="ghost" onClick={() => setSelectedChat(null)}><X className="h-4 w-4" /></Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="flex-1 p-0">
//               <ScrollArea className="h-[calc(100vh-280px)] p-4">
//                 {isLoadingMessages ? (
//                   <div className="space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-10 w-1/2 ml-auto" /></div>
//                 ) : (
//                   <div className="space-y-4">
//                     {messages.map((msg) => {
//                       const isOwnMessage = msg.sender_id === user!.id;
//                       return (
//                         <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
//                           <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
//                             <p className="text-sm">{msg.content}</p>
//                             <p className={`text-xs mt-1 text-right ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatTime(msg.timestamp)}</p>
//                           </div>
//                         </div>
//                       );
//                     })}
//                     <div ref={messagesEndRef} />
//                   </div>
//                 )}
//               </ScrollArea>
//             </CardContent>
//             <div className="border-t p-4">
//                 <div className="flex gap-2">
//                     <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." onKeyPress={handleKeyPress} />
//                     <Button onClick={sendMessage} disabled={!message.trim()}><Send className="h-4 w-4" /></Button>
//                 </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//              <div className="text-center space-y-4">
//               <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
//               <div>
//                 <h3 className="text-lg font-semibold">Select a chat</h3>
//                 <p className="text-muted-foreground">Choose a conversation to start messaging</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// };


// src/components/ChatView.tsx
// src/components/ChatView.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, ChatRoom, ChatMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Send, Plus, X, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export const ChatView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatRooms = [], isLoading: isLoadingRooms } = useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: chatApi.getRooms,
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', selectedChat],
    queryFn: () => (selectedChat ? chatApi.getMessages(selectedChat) : Promise.resolve([])),
    enabled: !!selectedChat,
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };
      ws.onerror = (error) => console.error('WebSocket error:', error);

      ws.onmessage = (event) => {
        try {
          // The backend now sends a consistent payload
          const newMessageData = JSON.parse(event.data);

          if (newMessageData.type === 'message') {
            // Create a valid ChatMessage object for the frontend state
            const newMessage: ChatMessage = {
                id: newMessageData.id,
                chat_room_id: newMessageData.chatId,
                sender_id: newMessageData.sender_id,
                content: newMessageData.text,
                timestamp: newMessageData.timestamp
            };

            // Add the new message to the react-query cache
            queryClient.setQueryData(
              ['chatMessages', newMessage.chat_room_id],
              (oldData: ChatMessage[] = []) => {
                if (!oldData.some(m => m.id === newMessage.id)) {
                  return [...oldData, newMessage];
                }
                return oldData;
              }
            );

            // Update chat room preview
            queryClient.setQueryData(
              ['chatRooms'],
              (oldRooms: ChatRoom[] = []) =>
                oldRooms.map(room =>
                  room.id === newMessage.chat_room_id
                    ? { ...room, lastMessage: newMessage.content, lastMessageTime: newMessage.timestamp }
                    : room
                )
            );
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    };

    connectWebSocket();
    return () => {
      wsRef.current?.close();
    };
  }, [queryClient]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !selectedChat || wsRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }

    // Directly send the message via WebSocket. No more optimistic updates.
    wsRef.current.send(JSON.stringify({
      type: 'message',
      chatId: selectedChat,
      text: message,
    }));
    
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const createNewChat = async () => {
      const chatName = prompt("Enter a name for the new chat:");
      if (chatName) {
          await chatApi.createRoom({ name: chatName, participants: [] });
          queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Chats</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? 'success' : 'destructive'} className="text-xs">{isConnected ? 'Live' : 'Offline'}</Badge>
                <Button size="sm" variant="outline" onClick={createNewChat}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {isLoadingRooms ? (
                <div className="space-y-2 p-4 pt-0">
                    <Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-1 p-4 pt-0">
                  {chatRooms.map((chat) => (
                    <div key={chat.id} onClick={() => setSelectedChat(chat.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedChat === chat.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}>
                      <Avatar><AvatarFallback>{chat.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{chat.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || 'No messages'}</p>
                      </div>
                      {chat.unread_count > 0 && <Badge variant="destructive">{chat.unread_count}</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{chatRooms.find(c => c.id === selectedChat)?.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                        <h3 className="font-semibold">{chatRooms.find(c => c.id === selectedChat)?.name}</h3>
                        <p className="text-xs text-muted-foreground">{isConnected ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost"><Phone className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost"><Video className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedChat(null)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-280px)] p-4">
                {isLoadingMessages ? (
                  <div className="space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-10 w-1/2 ml-auto" /></div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwnMessage = msg.sender_id === user!.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 text-right ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatTime(msg.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." onKeyPress={handleKeyPress} />
                    <Button onClick={sendMessage} disabled={!message.trim()}><Send className="h-4 w-4" /></Button>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
             <div className="text-center space-y-4">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Select a chat</h3>
                <p className="text-muted-foreground">Choose a conversation to start messaging</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};