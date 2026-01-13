-- Drop the overly permissive policy
DROP POLICY "System can create notifications" ON public.notifications;

-- Create a more restrictive policy - authenticated users can create notifications
-- This allows the edge function (with service role) and authenticated users to create
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);