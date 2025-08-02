import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Plus, X, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  sender?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isActive: boolean;
  participants: string[];
}

export const ChatView = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: 'General Support',
      lastMessage: 'Welcome to our support chat!',
      lastMessageTime: new Date(Date.now() - 30000),
      unreadCount: 2,
      isActive: true,
      participants: ['Support Team']
    },
    {
      id: '2', 
      name: 'Technical Issues',
      lastMessage: 'How can we help you today?',
      lastMessageTime: new Date(Date.now() - 300000),
      unreadCount: 0,
      isActive: false,
      participants: ['Tech Support']
    }
  ]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        text: 'Welcome to our support chat! How can we help you today?',
        timestamp: new Date(Date.now() - 30000),
        isOwn: false,
        sender: 'Support Team'
      }
    ],
    '2': [
      {
        id: '2',
        text: 'How can we help you today?',
        timestamp: new Date(Date.now() - 300000),
        isOwn: false,
        sender: 'Tech Support'
      }
    ]
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  useEffect(() => {
    // Initialize WebSocket connection
    const connectWebSocket = () => {
      try {
        // Replace with your actual WebSocket URL
        const ws = new WebSocket('ws://localhost:3000/ws');
        
        ws.onopen = () => {
          console.log('Connected to chat WebSocket');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'message') {
              const newMessage: Message = {
                id: data.id || Date.now().toString(),
                text: data.text,
                timestamp: new Date(data.timestamp),
                isOwn: false,
                sender: data.sender || 'Unknown'
              };

              setMessages(prev => ({
                ...prev,
                [data.chatId]: [...(prev[data.chatId] || []), newMessage]
              }));

              // Update last message in chat room
              setChatRooms(prev => prev.map(room => 
                room.id === data.chatId 
                  ? { ...room, lastMessage: data.text, lastMessageTime: new Date(data.timestamp) }
                  : room
              ));
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          console.log('Disconnected from chat WebSocket');
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        // Retry connection after 5 seconds
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      isOwn: true
    };

    // Add message to local state
    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }));

    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        chatId: selectedChat,
        text: message,
        timestamp: new Date().toISOString()
      }));
    }

    // Update last message in chat room
    setChatRooms(prev => prev.map(room => 
      room.id === selectedChat 
        ? { ...room, lastMessage: message, lastMessageTime: new Date() }
        : room
    ));

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatRoom = {
      id: newChatId,
      name: `Chat ${chatRooms.length + 1}`,
      unreadCount: 0,
      isActive: false,
      participants: []
    };

    setChatRooms(prev => [...prev, newChat]);
    setMessages(prev => ({ ...prev, [newChatId]: [] }));
    setSelectedChat(newChatId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Chat List Sidebar */}
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chats
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? 'success' : 'destructive'} className="text-xs">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <Button size="sm" variant="outline" onClick={createNewChat}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-1 p-4 pt-0">
                {chatRooms.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                      ${selectedChat === chat.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {chat.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">{chat.name}</h4>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatLastMessageTime(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Messages Area */}
      <Card className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {chatRooms.find(c => c.id === selectedChat)?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {chatRooms.find(c => c.id === selectedChat)?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isConnected ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedChat(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-280px)] p-4">
                <div className="space-y-4">
                  {(messages[selectedChat] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[70%] rounded-lg px-4 py-2
                          ${msg.isOwn 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                          }
                        `}
                      >
                        {!msg.isOwn && msg.sender && (
                          <p className="text-xs text-muted-foreground mb-1">{msg.sender}</p>
                        )}
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
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