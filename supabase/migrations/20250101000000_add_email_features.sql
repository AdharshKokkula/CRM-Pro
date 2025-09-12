-- Add email tracking columns to customers table
ALTER TABLE public.customers 
ADD COLUMN welcome_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN welcome_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN email_enabled BOOLEAN DEFAULT TRUE;

-- Create email logs table
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    email_address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create customer portal users table
CREATE TABLE public.customer_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_logs
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

-- RLS Policies for customer_users
CREATE POLICY "Users can view customer users for their customers"
    ON public.customer_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = customer_users.customer_id
            AND customers.owner_id = auth.uid()
        )
    );

CREATE POLICY "Customer users can view their own record"
    ON public.customer_users FOR SELECT
    USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can manage customer users for their customers"
    ON public.customer_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = customer_users.customer_id
            AND customers.owner_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX idx_email_logs_customer_id ON public.email_logs(customer_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);
CREATE INDEX idx_customer_users_customer_id ON public.customer_users(customer_id);
CREATE INDEX idx_customer_users_email ON public.customer_users(email);

-- Create trigger for updated_at
CREATE TRIGGER update_customer_users_updated_at
    BEFORE UPDATE ON public.customer_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();