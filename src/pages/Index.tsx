// src/pages/Index.tsx

import React, { useState, useEffect, useMemo } from 'react'; // NEW: Import useMemo
import { useQuery } from '@tanstack/react-query'; // NEW: Import useQuery
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { chatApi, ChatRoom } from '@/lib/api'; // NEW: Import chatApi and ChatRoom type
import { LoginForm } from '@/components/LoginForm';
import { DashboardView } from '@/components/DashboardView';
import { IntegrationsView } from '@/components/IntegrationsView';
import { SubmissionsView } from '@/components/SubmissionsView';
import { SettingsView } from '@/components/SettingsView';
import { ChatView } from '@/components/ChatView';
import { 
  Home, 
  Settings, 
  FileText, 
  Zap, 
  MessageCircle,
  Menu, 
  X, 
  Sun, 
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // NEW: Import Badge

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const Index = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { chatRooms } = useWebSocket();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const totalUnreadCount = useMemo(() => {
    return chatRooms.reduce((total, room) => total + (room.unread_count || 0), 0);
  }, [chatRooms]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'integrations': return <IntegrationsView />;
      case 'submissions': return <SubmissionsView />;
      case 'chat': return <ChatView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-sidebar-bg border-r border-sidebar-border transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <li key={item.id} className="relative">
                    <button
                      onClick={() => {
                        setCurrentView(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${isActive ? 'bg-nav-active-bg text-nav-active' : 'text-foreground hover:bg-nav-hover'}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                    {item.id === 'chat' && totalUnreadCount > 0 && (
                      <Badge 
                        variant="destructive"
                        className="absolute top-1 right-2 pointer-events-none"
                      >
                        {totalUnreadCount}
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
      
      <div className="lg:ml-64">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user?.name}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" onClick={logout} size="sm">
              Logout
            </Button>
          </div>
        </header>
        <main className="p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;