import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Copy, Key, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const SettingsView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKey] = useState('sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef');
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Feature coming soon",
      description: "Password change functionality will be available soon.",
    });
  };

  const handleRevokeKey = () => {
    toast({
      title: "Feature coming soon",
      description: "API key revocation functionality will be available soon.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and API configuration.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This key is used for website integration. Keep it secure and never share it publicly.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">Current API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  value={apiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button variant="destructive" onClick={handleRevokeKey} className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Revoke & Generate New Key
            </Button>
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm mt-1">{user?.name || 'Not provided'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm mt-1">{user?.email || 'Not provided'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">User ID</Label>
                <p className="text-sm mt-1 font-mono">{user?.id || 'Not provided'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Account Type</Label>
                <p className="text-sm mt-1">Premium</p>
              </div>
            </div>
            
            <Button onClick={handlePasswordChange} className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};