-- Fix security issue: temporarily drop dependent policy, recreate function, then recreate policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

DROP FUNCTION IF EXISTS public.has_role(_user_id UUID, _role app_role);

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

-- Recreate the policy
CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));