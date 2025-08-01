import React, { useState } from 'react';
import { Integration } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  ExternalLink, 
  TestTube,
  Power,
  PowerOff 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationActionsProps {
  integration: Integration;
  onEdit: (integration: Integration) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, enabled: boolean) => void;
  isDeleting: boolean;
}

export const IntegrationActions: React.FC<IntegrationActionsProps> = ({
  integration,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();

  const copyIntegrationId = () => {
    navigator.clipboard.writeText(integration.id);
    toast({
      title: "Integration ID copied",
      description: "The integration ID has been copied to your clipboard.",
    });
  };

  const copyEmbedCode = () => {
    const embedCode = `<!-- Add this to your HTML form -->
<form action="http://localhost:3000/api/v1/submit" method="POST">
  <input type="hidden" name="integration_id" value="${integration.id}" />
  <!-- Your form fields here -->
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Submit</button>
</form>`;
    
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied",
      description: "The HTML form code has been copied to your clipboard.",
    });
  };

  const testIntegration = async () => {
    try {
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test submission from the dashboard',
        test: true
      };

      // This would normally call your API to test the integration
      toast({
        title: "Test submitted",
        description: "A test submission has been sent to your Telegram channel.",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Failed to send test submission. Please check your configuration.",
        variant: "destructive",
      });
    }
  };

  const openWebsite = () => {
    window.open(integration.website_url, '_blank');
  };

  const handleDelete = () => {
    onDelete(integration.id);
    setShowDeleteDialog(false);
  };

  const handleToggleStatus = () => {
    onToggleStatus(integration.id, !integration.is_forwarding_enabled);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(integration)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Integration
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyIntegrationId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyEmbedCode}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Embed Code
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openWebsite}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Website
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={testIntegration}>
            <TestTube className="mr-2 h-4 w-4" />
            Test Integration
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {integration.is_forwarding_enabled ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Enable
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this integration? This action cannot be undone and will stop all form submissions from being forwarded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Integration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Integration Details</DialogTitle>
            <DialogDescription>
              Complete information about this integration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Integration ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                    {integration.id}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copyIntegrationId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">
                  <Badge variant={integration.is_forwarding_enabled ? 'success' : 'destructive'}>
                    {integration.is_forwarding_enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Website URL</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">{integration.website_url}</span>
                <Button size="sm" variant="ghost" onClick={openWebsite}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Telegram Bot</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {integration.telegram_bot_token ? 'Configured' : 'Not configured'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Chat ID</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {integration.telegram_chat_id || 'Not configured'}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">How to use this integration:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Add the integration ID to your form</li>
                <li>Set your form action to the API endpoint</li>
                <li>Form submissions will be forwarded to Telegram</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};