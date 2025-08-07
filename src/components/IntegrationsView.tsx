import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi, CreateIntegrationRequest, Integration } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntegrationForm } from '@/components/IntegrationForm';
import { IntegrationsTable } from '@/components/IntegrationsTable';
import { ApiKeyDisplay } from '@/components/ApiKeyDisplay';
import { IntegrationStats } from '@/components/IntegrationStats';

export const IntegrationsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
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
      resetForm();
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIntegrationRequest> }) =>
      integrationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      resetForm();
      toast({
        title: "Integration updated",
        description: "The integration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating integration",
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

  const resetForm = () => {
    setFormData({
      website_url: '',
      telegram_bot_token: '',
      telegram_chat_id: '',
      is_forwarding_enabled: true
    });
    setShowForm(false);
    setEditingIntegration(null);
  };

  const handleSave = () => {
    if (!formData.website_url || !formData.telegram_bot_token || !formData.telegram_chat_id) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingIntegration) {
      updateMutation.mutate({ id: editingIntegration.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (integration: Integration) => {
    setFormData({
      website_url: integration.website_url,
      telegram_bot_token: integration.telegram_bot_token || '',
      telegram_chat_id: integration.telegram_chat_id || '',
      is_forwarding_enabled: integration.is_forwarding_enabled
    });
    setEditingIntegration(integration);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: string, enabled: boolean) => {
    updateMutation.mutate({ 
      id, 
      data: { is_forwarding_enabled: enabled }
    });
  };

  const handleNewIntegration = () => {
    resetForm();
    setShowForm(true);
  };

  const integrations = Array.isArray(integrationsData) ? integrationsData : integrationsData?.integrations || [];

  console.log('Integrations data:', integrationsData);
  console.log('Integrations array:', integrations);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your website integrations and Telegram forwarding settings.
          </p>
        </div>
        <Button onClick={handleNewIntegration} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Integration
        </Button>
      </div>

      {/* Stats Overview */}
      <IntegrationStats integrations={integrations} />

      {/* API Key Display */}
      {generatedApiKey && (
        <ApiKeyDisplay
          apiKey={generatedApiKey}
          onDismiss={() => setGeneratedApiKey(null)}
        />
      )}

      {/* Integration Form */}
      {showForm && (
        <IntegrationForm
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={resetForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isEdit={!!editingIntegration}
        />
      )}

      {/* Integrations Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading integrations...</p>
        </div>
      ) : (
        <IntegrationsTable
          integrations={integrations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};