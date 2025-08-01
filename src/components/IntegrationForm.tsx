import React from 'react';
import { CreateIntegrationRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface IntegrationFormProps {
  formData: CreateIntegrationRequest;
  setFormData: (data: CreateIntegrationRequest) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
  isEdit = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Integration' : 'Add New Integration'}</CardTitle>
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
            onClick={onSave} 
            disabled={isLoading}
          >
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Integration' : 'Save Integration')}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};