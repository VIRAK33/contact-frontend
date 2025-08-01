import React from 'react';
import { Integration } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, XCircle, Globe, MessageSquare, Calendar } from 'lucide-react';

interface IntegrationStatsProps {
  integrations: Integration[];
}

export const IntegrationStats: React.FC<IntegrationStatsProps> = ({ integrations }) => {
  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter(i => i.is_forwarding_enabled).length;
  const inactiveIntegrations = totalIntegrations - activeIntegrations;
  const telegramConfigured = integrations.filter(i => i.telegram_bot_token && i.telegram_chat_id).length;

  const stats = [
    {
      title: 'Total Integrations',
      value: totalIntegrations,
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active',
      value: activeIntegrations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Inactive',
      value: inactiveIntegrations,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Telegram Configured',
      value: telegramConfigured,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};