import { supabase } from './client';

export const authConfig = {
  // Email confirmation settings
  emailRedirectTo: `${window.location.origin}/auth/callback`,
  
  // Sign up with email confirmation
  signUpWithEmailConfirmation: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  // Resend confirmation email
  resendConfirmation: async (email: string) => {
    return await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },
};