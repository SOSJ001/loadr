-- Jobs backend: app-owned status history, global count references, job_assigned notifications

-- ---------------------------------------------------------------------------
-- job_status_history: allow null old_status for initial creation entry
-- ---------------------------------------------------------------------------

ALTER TABLE public.job_status_history
  ALTER COLUMN old_status DROP NOT NULL;

-- ---------------------------------------------------------------------------
-- Drop DB trigger for status history (app layer owns writes)
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_jobs_status_history ON public.jobs;
DROP FUNCTION IF EXISTS public.record_job_status_change();

-- ---------------------------------------------------------------------------
-- Global count-based job reference (#0001, #0002, …)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_job_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
  next_num bigint;
  attempts integer := 0;
BEGIN
  IF NEW.reference IS NOT NULL AND NEW.reference <> '' THEN
    RETURN NEW;
  END IF;

  LOOP
    SELECT count(*) + 1 INTO next_num FROM public.jobs;
    candidate := '#' || lpad(next_num::text, 4, '0');

    IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE reference = candidate) THEN
      NEW.reference := candidate;
      RETURN NEW;
    END IF;

    attempts := attempts + 1;
    IF attempts >= 10 THEN
      RAISE EXCEPTION 'Failed to generate unique job reference after 10 attempts';
    END IF;
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- job_status_history INSERT policies (SELECT already exists)
-- ---------------------------------------------------------------------------

CREATE POLICY job_status_history_admin_insert ON public.job_status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = public.current_user_company_id()
    AND public.is_admin()
  );

CREATE POLICY job_status_history_driver_insert ON public.job_status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'driver'
    AND company_id = public.current_user_company_id()
    AND changed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_status_history.job_id
        AND j.assigned_driver_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- notifications: add job_assigned type
-- ---------------------------------------------------------------------------

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('job_complete', 'delivery_attempted', 'driver_activated', 'job_assigned'));
