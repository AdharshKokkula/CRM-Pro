import { supabase } from '@/integrations/supabase/client';
import emailjs from '@emailjs/browser';
import { emailConfig } from '@/config/email';
import { PasswordSetupService } from './passwordSetupService';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  customerName: string;
  customerId: string;
}

interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  login_link: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return !!(emailConfig.emailjs.serviceId && 
             emailConfig.emailjs.templateId && 
             emailConfig.emailjs.publicKey);
  }

  private static async logEmailAttempt(customerId: string, email: string, status: 'sent' | 'failed', error?: string) {
    // Log to console for now - can be enhanced later with proper logging table
    console.log(`Email ${status} for customer ${customerId} (${email})`, error ? `Error: ${error}` : '');
  }

  private static async sendEmailWithRetry(emailParams: EmailParams, attempts = 0): Promise<boolean> {
    try {
      // Initialize EmailJS if not already done
      if (emailConfig.emailjs.publicKey) {
        emailjs.init(emailConfig.emailjs.publicKey);
      }
      
      const response = await emailjs.send(
        emailConfig.emailjs.serviceId,
        emailConfig.emailjs.templateId,
        emailParams
      );
      
      console.log('Email sent successfully:', response.status, response.text);
      return true;
    } catch (error) {
      console.error(`Email send attempt ${attempts + 1} failed:`, error);
      
      if (attempts < emailConfig.settings.retryAttempts - 1) {
        console.log(`Retrying in ${emailConfig.settings.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, emailConfig.settings.retryDelay));
        return this.sendEmailWithRetry(emailParams, attempts + 1);
      }
      
      throw error;
    }
  }

  private static generateWelcomeEmailHTML(customerName: string, setupLink: string, isPasswordSetup: boolean = false): string {
    const actionText = 'Access Your Portal';
    const instructionText = 'Click below to access your customer portal. If this is your first time, you\'ll be able to create your password directly in the portal.';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Custodian CRM</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Custodian CRM</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello ${customerName}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Welcome to our customer portal! We're excited to have you on board.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${instructionText}
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e293b;">What you can do in your portal:</h3>
              <ul style="margin: 10px 0;">
                <li>View your account information</li>
                <li>Track your leads and opportunities</li>
                <li>Access communication history</li>
                <li>Update your contact details</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupLink}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ${actionText}
              </a>
            </div>
            

            

            
            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <h4 style="margin-top: 0; color: #475569;">Need Help?</h4>
              <p style="margin-bottom: 0; font-size: 14px;">
                If you have any questions or need assistance, please don't hesitate to contact our support team at 
                <a href="mailto:support@custodian-crm.com" style="color: #3b82f6;">support@custodian-crm.com</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #64748b;">
            <p>© 2024 Custodian CRM. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  static async sendWelcomeEmail(customerData: { id: string; name: string; email: string }): Promise<boolean> {
    try {
      // Check if email service is configured
      if (!this.isConfigured()) {
        console.warn('Email service not configured. Skipping email send.');
        await this.logEmailAttempt(customerData.id, customerData.email, 'failed', 'Email service not configured');
        return false;
      }

      // Always send direct portal link - password setup will be handled in the portal
      const setupLink = `${window.location.origin}/customer-portal/login?email=${encodeURIComponent(customerData.email)}`;
      const needsPasswordSetup = false;
      
      const emailParams: EmailParams = {
        to_email: customerData.email,
        to_name: customerData.name,
        subject: needsPasswordSetup ? 'Welcome to Custodian CRM - Set Up Your Password' : 'Welcome to Custodian CRM - Your Portal Access',
        message: this.generateWelcomeEmailText(customerData.name, setupLink, needsPasswordSetup),
        login_link: setupLink,
      };

      console.log('Sending welcome email to:', customerData.email);
      
      // Send email with retry logic
      const success = await this.sendEmailWithRetry(emailParams);
      
      if (success) {
        // Log successful email attempt
        await this.logEmailAttempt(customerData.id, customerData.email, 'sent');

        // Update customer record with email status
        await supabase
          .from('customers')
          .update({
            welcome_email_sent: true,
            welcome_email_sent_at: new Date().toISOString(),
          })
          .eq('id', customerData.id);

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      
      // Log failed email attempt
      await this.logEmailAttempt(
        customerData.id, 
        customerData.email, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );

      return false;
    }
  }

  private static generateWelcomeEmailText(customerName: string, setupLink: string, isPasswordSetup: boolean = false): string {
    const actionText = 'Access your portal';
    const instructionText = 'Click below to access your customer portal. If this is your first time, you\'ll be able to create your password directly in the portal.';
    
    return `
Hello ${customerName}!

Welcome to Custodian CRM! We're excited to have you on board.

${instructionText}

What you can do in your portal:
• View your account information
• Track your leads and opportunities  
• Access communication history
• Update your contact details

${actionText}: ${setupLink}

Need Help?
If you have any questions or need assistance, please contact our support team at support@custodian-crm.com

© 2024 Custodian CRM. All rights reserved.
    `;
  }

  static async resendWelcomeEmail(customerId: string): Promise<boolean> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('id', customerId)
        .single();

      if (error || !customer) {
        throw new Error('Customer not found');
      }

      return await this.sendWelcomeEmail(customer);
    } catch (error) {
      console.error('Failed to resend welcome email:', error);
      return false;
    }
  }
}