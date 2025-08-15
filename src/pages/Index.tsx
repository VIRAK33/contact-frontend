import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
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
  Sun, 
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
} from '@/components/ui/sidebar';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function AppSidebar({ currentView, setCurrentView, totalUnreadCount }: {
  currentView: string;
  setCurrentView: (view: string) => void;
  totalUnreadCount: number;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="bg-background border-border">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <img src="/logo.webp" alt="Logo" className="h-8 w-8 flex-shrink-0" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <SidebarMenuItem key={item.id} className="relative">
                     <SidebarMenuButton
                      onClick={() => setCurrentView(item.id)}
                      isActive={isActive}
                      tooltip={collapsed ? item.label : undefined}
                      className="text-base"
                    >
                      <Icon className="h-5 w-5" />
                      {!collapsed && <span className="text-base font-medium">{item.label}</span>}
                    </SidebarMenuButton>
                    {item.id === 'chat' && totalUnreadCount > 0 && !collapsed && (
                      <Badge 
                        variant="destructive"
                        className="absolute top-1 right-2 pointer-events-none text-xs px-1.5 py-0.5"
                      >
                        {totalUnreadCount}
                      </Badge>
                    )}
                    {item.id === 'chat' && totalUnreadCount > 0 && collapsed && (
                      <Badge 
                        variant="destructive"
                        className="absolute -top-1 -right-1 pointer-events-none text-xs px-1 py-0 h-5 w-5 flex items-center justify-center rounded-full"
                      >
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                      </Badge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const Index = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { chatRooms } = useWebSocket();
  const [currentView, setCurrentView] = useState('dashboard');
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
    <SidebarProvider>
      <div className="min-h-screen w-full bg-dashboard-bg flex">
        <AppSidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          totalUnreadCount={totalUnreadCount}
        />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
            <SidebarTrigger />
            
            <div className="flex items-center gap-4">
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
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;