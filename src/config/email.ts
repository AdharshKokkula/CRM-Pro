// Email configuration
export const emailConfig = {
  // For development - using EmailJS (free tier)
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_default',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_default',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  },
  
  // For production - can be configured for SendGrid, Mailgun, etc.
  production: {
    apiKey: import.meta.env.VITE_EMAIL_API_KEY || '',
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@custodian-crm.com',
    fromName: import.meta.env.VITE_FROM_NAME || 'Custodian CRM',
  },
  
  // Email settings
  settings: {
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
    timeout: 10000, // 10 seconds
  }
};