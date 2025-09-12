import { EmailService } from '@/services/emailService';
import { emailConfig } from '@/config/email';

export class EmailTestUtils {
  static checkConfiguration(): { isConfigured: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!emailConfig.emailjs.serviceId || emailConfig.emailjs.serviceId === 'service_default') {
      missing.push('VITE_EMAILJS_SERVICE_ID');
    }
    
    if (!emailConfig.emailjs.templateId || emailConfig.emailjs.templateId === 'template_default') {
      missing.push('VITE_EMAILJS_TEMPLATE_ID');
    }
    
    if (!emailConfig.emailjs.publicKey) {
      missing.push('VITE_EMAILJS_PUBLIC_KEY');
    }
    
    return {
      isConfigured: missing.length === 0,
      missing
    };
  }

  static async sendTestEmail(testEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = this.checkConfiguration();
      
      if (!config.isConfigured) {
        return {
          success: false,
          error: `Missing configuration: ${config.missing.join(', ')}`
        };
      }

      const success = await EmailService.sendWelcomeEmail({
        id: 'test-' + Date.now(),
        name: 'Test User',
        email: testEmail
      });

      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static logConfigurationStatus(): void {
    const config = this.checkConfiguration();
    
    console.group('📧 Email Configuration Status');
    console.log('Configured:', config.isConfigured ? '✅' : '❌');
    
    if (!config.isConfigured) {
      console.log('Missing variables:', config.missing);
      console.log('Please check your .env file and ensure these variables are set.');
    }
    
    console.log('Current config:', {
      serviceId: emailConfig.emailjs.serviceId,
      templateId: emailConfig.emailjs.templateId,
      publicKey: emailConfig.emailjs.publicKey ? '***' + emailConfig.emailjs.publicKey.slice(-4) : 'Not set'
    });
    
    console.groupEnd();
  }
}

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as any).EmailTestUtils = EmailTestUtils;
}