import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useRef,
  useCallback, 
  ReactNode 
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { chatApi, ChatRoom, ChatMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface WebSocketContextType {
  isConnected: boolean;
  chatRooms: ChatRoom[];
  sendMessage: (chatId: string, text: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // --- NEW: We now fetch the initial data inside the context ---
  // This makes the context the single source of truth for the room list.
  const { data: initialChatRooms } = useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: chatApi.getRooms,
    enabled: isAuthenticated, // Only fetch if the user is logged in
  });

  // --- NEW: This effect synchronizes the query data with our context state ---
  useEffect(() => {
    if (initialChatRooms) {
      setChatRooms(initialChatRooms);
    }
  }, [initialChatRooms]);


  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const connect = () => {
      const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => {
        setIsConnected(false);
        if (localStorage.getItem('auth_token')) setTimeout(connect, 5000);
      };
      ws.onerror = (error) => console.error('Global WebSocket error:', error);

      ws.onmessage = (event) => {
        try {
          const newMessage: ChatMessage = JSON.parse(event.data);
          if (newMessage.type === 'message') {
            // Update the global list of chat rooms in this context's state
            setChatRooms(prevRooms => {
              let roomName = 'a chat';
              const updatedRooms = prevRooms.map(room => {
                if (room.id === newMessage.chat_room_id) {
                  roomName = room.name;
                  const isFromVisitor = newMessage.sender_id !== user!.id;
                  
                  const isActiveQuery = queryClient.getQueryCache().find({ queryKey: ['chatMessages', room.id], fetchStatus: 'fetching' });

                  if (isFromVisitor && !isActiveQuery) {
                    toast({ title: `New message from ${roomName}`, description: newMessage.content });
                    return { ...room, lastMessage: newMessage.content, lastMessageTime: newMessage.timestamp, unread_count: (room.unread_count || 0) + 1 };
                  }
                  return { ...room, lastMessage: newMessage.content, lastMessageTime: newMessage.timestamp };
                }
                return room;
              });
              // Handle case where a new chat room is created by a visitor
              const roomExists = updatedRooms.some(room => room.id === newMessage.chat_room_id);
              if (!roomExists) {
                  queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
              }
              return updatedRooms;
            });
            
            // Also update the react-query cache for ChatView's useQuery to pick up
            queryClient.setQueryData(
              ['chatMessages', newMessage.chat_room_id],
              (oldData: ChatMessage[] = []) => {
                if (!oldData.some(m => m.id === newMessage.id)) return [...oldData, newMessage];
                return oldData;
              }
            );
          }
        } catch (error) { console.error('Error parsing WebSocket message:', error); }
      };
    };

    connect();
    return () => { wsRef.current?.close(); };
  }, [isAuthenticated, queryClient, user, toast]);

  const sendMessage = useCallback((chatId: string, text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', chatId, text }));
    }
  }, []);

  const value = { isConnected, chatRooms, sendMessage };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};