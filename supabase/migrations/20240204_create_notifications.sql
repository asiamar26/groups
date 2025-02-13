-- Drop existing table if it exists
DROP TABLE IF EXISTS public.notifications;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id bigint NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('group_join_approved', 'group_join_rejected', 'group_invite', 'group_role_change')),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_group_id ON public.notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Grant access to authenticated users
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- Insert some test notifications if groups table exists
DO $$
DECLARE
  first_group_id UUID;
  first_user_id UUID;
BEGIN
  -- Get the first group ID if exists
  SELECT id INTO first_group_id FROM public.groups LIMIT 1;
  
  -- Get the first user ID if exists
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Only insert if we have both a group and a user
  IF first_group_id IS NOT NULL AND first_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, message, group_id)
    VALUES (
      first_user_id,
      'group_join_approved',
      'Your request to join Test Group has been approved.',
      first_group_id
    );
  END IF;
END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at(); 