import { supabase } from '@/integrations/supabase/client';

export class DatabaseChecker {
  static async checkEmailColumns(): Promise<{ hasColumns: boolean; missingColumns: string[] }> {
    try {
      // Try to select the email columns to see if they exist
      const { data, error } = await supabase
        .from('customers')
        .select('welcome_email_sent, welcome_email_sent_at, email_enabled')
        .limit(1);

      if (error) {
        // Parse error to see which columns are missing
        const missingColumns: string[] = [];
        if (error.message?.includes('welcome_email_sent')) {
          missingColumns.push('welcome_email_sent');
        }
        if (error.message?.includes('welcome_email_sent_at')) {
          missingColumns.push('welcome_email_sent_at');
        }
        if (error.message?.includes('email_enabled')) {
          missingColumns.push('email_enabled');
        }
        
        return { hasColumns: false, missingColumns };
      }

      return { hasColumns: true, missingColumns: [] };
    } catch (error) {
      console.error('Error checking database columns:', error);
      return { hasColumns: false, missingColumns: ['unknown'] };
    }
  }

  static async checkEmailLogsTable(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_logs')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      return false;
    }
  }

  static async runDatabaseCheck(): Promise<void> {
    console.group('🔍 Database Structure Check');
    
    const columnCheck = await this.checkEmailColumns();
    const tableCheck = await this.checkEmailLogsTable();
    
    console.log('Email columns in customers table:', columnCheck.hasColumns ? '✅' : '❌');
    if (!columnCheck.hasColumns) {
      console.log('Missing columns:', columnCheck.missingColumns);
    }
    
    console.log('Email logs table exists:', tableCheck ? '✅' : '❌');
    
    if (!columnCheck.hasColumns || !tableCheck) {
      console.warn('⚠️ Database migration required!');
      console.log('📋 Run the ADD_EMAIL_COLUMNS.sql script in your Supabase dashboard');
    } else {
      console.log('✅ Database structure is correct');
    }
    
    console.groupEnd();
  }
}

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as any).DatabaseChecker = DatabaseChecker;
}