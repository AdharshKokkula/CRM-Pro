import { supabase } from '@/integrations/supabase/client';

export class PasswordTokenService {
  private static generateSecureToken(): string {
    // Generate a secure random token using Web Crypto API
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static async createPasswordSetupToken(customerId: string): Promise<string | null> {
    try {
      const token = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      const { error } = await supabase
        .from('customer_password_tokens')
        .insert({
          customer_id: customerId,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;
      return token;
    } catch (error) {
      console.error('Failed to create password setup token:', error);
      return null;
    }
  }

  static async validateToken(token: string): Promise<{ valid: boolean; customerId?: string; customerData?: any }> {
    try {
      const { data: tokenData, error } = await supabase
        .from('customer_password_tokens')
        .select(`
          id,
          customer_id,
          expires_at,
          used,
          customers (
            id,
            name,
            email,
            password_setup_completed
          )
        `)
        .eq('token', token)
        .eq('used', false)
        .single();

      if (error || !tokenData) {
        return { valid: false };
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return { valid: false };
      }

      return {
        valid: true,
        customerId: tokenData.customer_id,
        customerData: tokenData.customers
      };
    } catch (error) {
      console.error('Failed to validate token:', error);
      return { valid: false };
    }
  }

  static async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('customer_password_tokens')
        .update({ used: true })
        .eq('token', token)
        .select();

      if (error) {
        console.error('Database error marking token as used:', error);
        return false;
      }

      if (!data || data.length === 0) {
        console.error('Token not found or already used:', token);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to mark token as used:', error);
      return false;
    }
  }
}