import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi, CreateIntegrationRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const IntegrationsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateIntegrationRequest>({
    website_url: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    is_forwarding_enabled: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: integrationsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setGeneratedApiKey(data.api_key);
      setFormData({
        website_url: '',
        telegram_bot_token: '',
        telegram_chat_id: '',
        is_forwarding_enabled: true
      });
      setShowForm(false);
      toast({
        title: "Integration created",
        description: "Your new integration has been created successfully. Make sure to copy your API key!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: integrationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Integration deleted",
        description: "The integration has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!formData.website_url || !formData.telegram_bot_token || !formData.telegram_chat_id) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      deleteMutation.mutate(id);
    }
  };

  const copyApiKey = () => {
    if (generatedApiKey) {
      navigator.clipboard.writeText(generatedApiKey);
      toast({
        title: "API key copied",
        description: "The API key has been copied to your clipboard.",
      });
    }
  };

  const integrations = integrationsData?.integrations || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your website integrations and Telegram forwarding settings.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Integration
        </Button>
      </div>

      {/* API Key Display */}
      {generatedApiKey && (
        <Card className="border-success">
          <CardHeader>
            <CardTitle className="text-success">New API Key Generated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your new API key has been generated. Copy it now as it won't be shown again.
            </p>
            <div className="flex gap-2">
              <Input
                value={generatedApiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyApiKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setGeneratedApiKey(null)}
              size="sm"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New Integration Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  placeholder="https://yourwebsite.com"
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramBotToken">Telegram Bot Token *</Label>
                <Input
                  id="telegramBotToken"
                  placeholder="bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={formData.telegram_bot_token}
                  onChange={(e) => setFormData({...formData, telegram_bot_token: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramChatId">Telegram Group/Chat ID *</Label>
                <Input
                  id="telegramChatId"
                  placeholder="-1001234567890"
                  value={formData.telegram_chat_id}
                  onChange={(e) => setFormData({...formData, telegram_chat_id: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="forwardingEnabled"
                  checked={formData.is_forwarding_enabled}
                  onCheckedChange={(checked) => setFormData({...formData, is_forwarding_enabled: checked})}
                />
                <Label htmlFor="forwardingEnabled">Forwarding Enabled</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Save Integration'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading integrations...</p>
            </div>
          ) : integrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Website URL</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {integrations.map((integration) => (
                    <tr key={integration.id} className="border-b last:border-0">
                      <td className="py-3 px-4 font-mono text-sm">{integration.id}</td>
                      <td className="py-3 px-4">{integration.website_url}</td>
                      <td className="py-3 px-4">
                        <Badge variant={integration.is_forwarding_enabled ? 'success' : 'destructive'}>
                          {integration.is_forwarding_enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(integration.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No integrations found</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first integration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};