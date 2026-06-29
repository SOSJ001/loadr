-- Driver issue photos and PoD uploads: storage bucket + history attachment URL

ALTER TABLE public.job_status_history
  ADD COLUMN IF NOT EXISTS attachment_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('job-uploads', 'job-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Admins read all objects in their company folder
CREATE POLICY job_uploads_admin_select ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'job-uploads'
    AND (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Drivers read objects for jobs they are assigned to
CREATE POLICY job_uploads_driver_select ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'job-uploads'
    AND (storage.foldername(name))[2] IN (
      SELECT j.id::text FROM public.jobs j
      WHERE j.assigned_driver_id = auth.uid()
    )
  );
