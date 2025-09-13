// Environment configuration
export const config = {
  // App URL - automatically uses correct URL based on environment
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
  
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // EmailJS configuration
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  },
  
  // Email settings
  email: {
    fromEmail: import.meta.env.VITE_FROM_EMAIL,
    fromName: import.meta.env.VITE_FROM_NAME,
  },
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;