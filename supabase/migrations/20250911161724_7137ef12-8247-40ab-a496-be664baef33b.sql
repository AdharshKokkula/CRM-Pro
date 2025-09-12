-- Fix security issue: update function to set search_path to empty string
-- Drop function with cascade to handle dependencies
DROP FUNCTION IF EXISTS public.has_role(_user_id UUID, _role app_role) CASCADE;

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Recreate the policy that was dropped due to cascade
CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));