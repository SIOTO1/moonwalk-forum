-- Enable RLS on realtime.messages and add policies that constrain which
-- channel "topic" an authenticated user is allowed to subscribe to / write to.
-- This addresses REALTIME_MISSING_CHANNEL_AUTHORIZATION.
--
-- Allowed topics:
--   * public forum channels: votes-realtime, comments-realtime,
--     thread-votes-<postId>, thread-comments-<postId>
--   * a user's own private channel: notifications:<their auth.uid()>
--
-- Note: postgres_changes rows are still filtered by table RLS independently;
-- this layer governs who may join/listen on a given topic name at all.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read allowed channels" ON realtime.messages;
CREATE POLICY "Authenticated can read allowed channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Public forum channels (anyone signed in)
  (realtime.topic() IN ('votes-realtime', 'comments-realtime'))
  OR realtime.topic() LIKE 'thread-votes-%'
  OR realtime.topic() LIKE 'thread-comments-%'
  -- Private per-user channels: only the owner
  OR realtime.topic() = ('notifications:' || auth.uid()::text)
);

DROP POLICY IF EXISTS "Authenticated can write allowed channels" ON realtime.messages;
CREATE POLICY "Authenticated can write allowed channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() IN ('votes-realtime', 'comments-realtime'))
  OR realtime.topic() LIKE 'thread-votes-%'
  OR realtime.topic() LIKE 'thread-comments-%'
  OR realtime.topic() = ('notifications:' || auth.uid()::text)
);