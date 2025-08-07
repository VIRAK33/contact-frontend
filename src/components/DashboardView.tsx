import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrationsApi, submissionsApi } from '@/lib/api';
import { Activity, Zap, TrendingUp, Clock, FileText, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DashboardView = () => {
  const { data: integrationsData } = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsApi.getAll,
  });

  const { data: submissionsData } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => submissionsApi.getAll({ limit: 5 }),
  });

  const integrations = Array.isArray(integrationsData) ? integrationsData : integrationsData?.integrations || [];
  const submissions = submissionsData?.submissions || [];
  const activeIntegrations = integrations.filter(int => int.is_forwarding_enabled).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your integrations.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-3xl font-bold">{submissionsData?.total_items || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Integrations</p>
                <p className="text-3xl font-bold">{activeIntegrations}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Integrations</p>
                <p className="text-3xl font-bold">{integrations.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Submissions</p>
                <p className="text-3xl font-bold">
                  {submissions.filter(s => 
                    new Date(s.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div key={submission.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Form submission from {submission.form_data?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(submission.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      Integration #{submission.integration_id}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No submissions yet</p>
            )}
          </CardContent>
        </Card>

        {/* Integrations Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Integrations at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.length > 0 ? (
              integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{integration.website_url}</p>
                    <p className="text-xs text-muted-foreground">
                      Forwarding: {integration.is_forwarding_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Badge variant={integration.is_forwarding_enabled ? 'success' : 'destructive'}>
                    {integration.is_forwarding_enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No integrations configured yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};