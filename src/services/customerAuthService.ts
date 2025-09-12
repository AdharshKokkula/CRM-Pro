import { supabase } from '@/integrations/supabase/client';

export class CustomerAuthService {
  static async checkCustomerExists(email: string): Promise<{ exists: boolean; customer?: any; hasPassword?: boolean }> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('id, name, email, password_setup_completed, auth_user_id')
        .eq('email', email)
        .single();

      if (error || !customer) {
        return { exists: false };
      }

      return {
        exists: true,
        customer,
        hasPassword: customer.password_setup_completed
      };
    } catch (error) {
      console.error('Error checking customer:', error);
      return { exists: false };
    }
  }

  static async createCustomerAuthUser(customerData: { id: string; name: string; email: string }, password: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: customerData.email,
        password,
        options: {
          data: {
            customer_id: customerData.id,
            full_name: customerData.name,
            user_type: 'customer',
          },
        },
      });

      if (authError) throw authError;

      // Update customer record
      await supabase
        .from('customers')
        .update({
          password_setup_completed: true,
          auth_user_id: authData.user?.id,
        })
        .eq('id', customerData.id);

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Error creating customer auth user:', error);
      return { success: false, error };
    }
  }

  static async signInCustomer(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update last login time
      if (data.user) {
        await supabase
          .from('customers')
          .update({ updated_at: new Date().toISOString() })
          .eq('auth_user_id', data.user.id);
      }

      return { success: true, session: data.session, user: data.user };
    } catch (error) {
      console.error('Error signing in customer:', error);
      return { success: false, error };
    }
  }
}