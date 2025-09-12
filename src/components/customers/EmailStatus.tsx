import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EmailService } from '@/services/emailService';
import { Mail, MailCheck, MailX, RefreshCw } from 'lucide-react';

interface EmailStatusProps {
  customer: {
    id: string;
    name: string;
    email: string;
    welcome_email_sent?: boolean;
    welcome_email_sent_at?: string;
  };
  onEmailSent?: () => void;
}

export function EmailStatus({ customer, onEmailSent }: EmailStatusProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleResendEmail = async () => {
    setSending(true);
    try {
      const success = await EmailService.resendWelcomeEmail(customer.id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Welcome email sent successfully',
        });
        onEmailSent?.();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send welcome email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in handleResendEmail:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send welcome email',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getEmailStatus = () => {
    if (customer.welcome_email_sent) {
      return {
        status: 'sent',
        icon: MailCheck,
        color: 'bg-green-100 text-green-800',
        text: 'Sent',
      };
    } else {
      return {
        status: 'not-sent',
        icon: MailX,
        color: 'bg-gray-100 text-gray-800',
        text: 'Not Sent',
      };
    }
  };

  const emailStatus = getEmailStatus();
  const StatusIcon = emailStatus.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge className={emailStatus.color} variant="secondary">
        <StatusIcon className="h-3 w-3 mr-1" />
        {emailStatus.text}
      </Badge>
      
      {customer.welcome_email_sent_at && (
        <span className="text-xs text-muted-foreground">
          {new Date(customer.welcome_email_sent_at).toLocaleDateString()}
        </span>
      )}
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleResendEmail}
        disabled={sending}
        title="Send/Resend welcome email"
      >
        {sending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          <Mail className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}