-- Run this SQL in your Supabase SQL Editor to ensure email functionality works

-- 1. Add email tracking columns to customers table (if they don't exist)
DO $$ 
BEGIN
    -- Add welcome_email_sent column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'welcome_email_sent') THEN
        ALTER TABLE public.customers ADD COLUMN welcome_email_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add welcome_email_sent_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'welcome_email_sent_at') THEN
        ALTER TABLE public.customers ADD COLUMN welcome_email_sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add email_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'email_enabled') THEN
        ALTER TABLE public.customers ADD COLUMN email_enabled BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 2. Create email_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    email_address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Enable RLS on email_logs if not already enabled
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for email_logs (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view email logs for their customers" ON public.email_logs;
DROP POLICY IF EXISTS "Users can insert email logs for their customers" ON public.email_logs;

CREATE POLICY "Users can view email logs for their customers"
    ON public.email_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = email_logs.customer_id
            AND customers.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert email logs for their customers"
    ON public.email_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = email_logs.customer_id
            AND customers.owner_id = auth.uid()
        )
    );

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_customer_id ON public.email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

-- 6. Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- 7. Check existing customers and their email status
SELECT 
    name, 
    email, 
    welcome_email_sent, 
    welcome_email_sent_at,
    created_at
FROM public.customers 
ORDER BY created_at DESC 
LIMIT 5;