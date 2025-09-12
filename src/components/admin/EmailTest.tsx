import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EmailTestUtils } from '@/utils/emailTest';
import { emailConfig } from '@/config/email';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function EmailTest() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const config = EmailTestUtils.checkConfiguration();

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    setLastTestResult(null);

    try {
      const result = await EmailTestUtils.sendTestEmail(testEmail);
      setLastTestResult(result);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Test email sent successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send test email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setLastTestResult(errorResult);
      
      toast({
        title: 'Error',
        description: errorResult.error,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration Test
        </CardTitle>
        <CardDescription>
          Test your email configuration and send a test email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Configuration Status</h4>
          <div className="flex items-center gap-2">
            {config.isConfigured ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
          
          {!config.isConfigured && (
            <div className="text-sm text-red-600">
              Missing: {config.missing.join(', ')}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Service ID: {emailConfig.emailjs.serviceId}</div>
            <div>Template ID: {emailConfig.emailjs.templateId}</div>
            <div>Public Key: {emailConfig.emailjs.publicKey ? '***' + emailConfig.emailjs.publicKey.slice(-4) : 'Not set'}</div>
          </div>
        </div>

        {/* Test Email */}
        <div className="space-y-2">
          <h4 className="font-medium">Send Test Email</h4>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter test email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={!config.isConfigured}
            />
            <Button 
              onClick={handleTestEmail}
              disabled={!config.isConfigured || testing || !testEmail}
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send Test'
              )}
            </Button>
          </div>
        </div>

        {/* Last Test Result */}
        {lastTestResult && (
          <div className="space-y-2">
            <h4 className="font-medium">Last Test Result</h4>
            <div className="flex items-center gap-2">
              {lastTestResult.success ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Success
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
              )}
            </div>
            
            {lastTestResult.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {lastTestResult.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}