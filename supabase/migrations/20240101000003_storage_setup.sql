-- Storage bucket and policies for private photo evidence
-- Evidence photos are stored per user and protected by RLS

-- Create private storage bucket for challenge evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-evidence', 'challenge-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for challenge-evidence bucket

-- Users can upload evidence to their own folder
CREATE POLICY "Users can upload own evidence"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'challenge-evidence' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own evidence
CREATE POLICY "Users can read own evidence"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'challenge-evidence' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users cannot update or delete evidence
-- No UPDATE or DELETE policies = operations blocked for regular users

-- Admin/service role can read all evidence for moderation (future use)
-- This policy is not added yet to keep the MVP simple
