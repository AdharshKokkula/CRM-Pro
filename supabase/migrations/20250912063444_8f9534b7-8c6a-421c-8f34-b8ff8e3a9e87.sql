-- Create task priority enum
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create task status enum  
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'review', 'completed');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'todo',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC(5,2),
  actual_hours NUMERIC(5,2) DEFAULT 0,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_customers junction table (many-to-many relationship)
CREATE TABLE public.task_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, customer_id)
);

-- Create task_comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasks
CREATE POLICY "Users can view their own tasks or assigned tasks"
ON public.tasks FOR SELECT
USING (owner_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can create their own tasks"
ON public.tasks FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own tasks or assigned tasks"
ON public.tasks FOR UPDATE
USING (owner_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE
USING (owner_id = auth.uid());

-- RLS policies for task_customers
CREATE POLICY "Users can view task-customer relationships for their tasks"
ON public.task_customers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_id AND (t.owner_id = auth.uid() OR t.assigned_to = auth.uid())
));

CREATE POLICY "Users can create task-customer relationships for their tasks"
ON public.task_customers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_id AND t.owner_id = auth.uid()
));

CREATE POLICY "Users can delete task-customer relationships for their tasks"
ON public.task_customers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_id AND t.owner_id = auth.uid()
));

-- RLS policies for task_comments
CREATE POLICY "Users can view comments for their tasks"
ON public.task_comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks t 
  WHERE t.id = task_id AND (t.owner_id = auth.uid() OR t.assigned_to = auth.uid())
));

CREATE POLICY "Users can create comments for their tasks"
ON public.task_comments FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_id AND (t.owner_id = auth.uid() OR t.assigned_to = auth.uid())
  )
);

CREATE POLICY "Users can update their own comments"
ON public.task_comments FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
ON public.task_comments FOR DELETE
USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();