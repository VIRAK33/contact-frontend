import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDisplayProps {
  apiKey: string;
  onDismiss: () => void;
}

export const ApiKeyDisplay: React.FC<ApiKeyDisplayProps> = ({ apiKey, onDismiss }) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const { toast } = useToast();

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  return (
    <Card className="border-success bg-success/5">
      <CardHeader>
        <CardTitle className="text-success flex items-center gap-2">
          🎉 New API Key Generated
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm font-medium text-warning-foreground mb-2">⚠️ Important Security Notice</p>
          <p className="text-sm text-muted-foreground">
            Copy this API key now! For security reasons, it won't be shown again. Store it safely as you'll need it to integrate your forms.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Your API Key:</label>
          <div className="flex gap-2">
            <Input
              value={isVisible ? apiKey : '•'.repeat(apiKey.length)}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsVisible(!isVisible)}
              title={isVisible ? "Hide API key" : "Show API key"}
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={copyApiKey} title="Copy API key">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">💡 How to use this API key:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Add this API key to your form's configuration</li>
            <li>Set your form's action URL to include this key</li>
            <li>Form submissions will be forwarded to your Telegram</li>
          </ol>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDismiss} size="sm">
            I've saved it safely
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};