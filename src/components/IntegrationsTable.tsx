import React from 'react';
import { Integration } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Copy, Eye, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IntegrationActions } from '@/components/IntegrationActions';

interface IntegrationsTableProps {
  integrations: Integration[];
  onEdit: (integration: Integration) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, enabled: boolean) => void;
  isDeleting: boolean;
}

export const IntegrationsTable: React.FC<IntegrationsTableProps> = ({
  integrations,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting
}) => {
  const { toast } = useToast();

  const copyIntegrationId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Integration ID copied",
      description: "The integration ID has been copied to your clipboard.",
    });
  };

  const openWebsite = (url: string) => {
    window.open(url, '_blank');
  };

  console.log('IntegrationsTable received:', integrations);

  if (integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <ExternalLink className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
            <p className="text-muted-foreground mb-4">Create your first integration to start collecting form submissions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Integrations ({integrations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Integration ID</TableHead>
              <TableHead>Website URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Telegram Bot</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.map((integration) => (
              <TableRow key={integration.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {integration.id.slice(0, 8)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyIntegrationId(integration.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]">{integration.website_url}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openWebsite(integration.website_url)}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={integration.is_forwarding_enabled ? 'success' : 'destructive'}>
                    {integration.is_forwarding_enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {integration.telegram_bot_token ? (
                      <>
                        <span className="text-xs text-muted-foreground">Bot configured</span>
                        <div className="h-2 w-2 bg-success rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground">No bot</span>
                        <div className="h-2 w-2 bg-muted rounded-full"></div>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <IntegrationActions
                    integration={integration}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    isDeleting={isDeleting}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};