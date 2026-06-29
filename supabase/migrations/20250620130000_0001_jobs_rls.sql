-- 0001_jobs_rls.sql
-- Layer 1 hard floor for jobs table (v1.1)
-- Admin: company_id scoped via current_user_company_id()
-- Driver: assigned_driver_id = auth.uid()

DROP POLICY IF EXISTS jobs_admin_all ON public.jobs;
DROP POLICY IF EXISTS jobs_driver_select ON public.jobs;
DROP POLICY IF EXISTS jobs_driver_update ON public.jobs;

CREATE POLICY jobs_admin_all ON public.jobs
  FOR ALL TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin())
  WITH CHECK (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY jobs_driver_select ON public.jobs
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'driver'
    AND assigned_driver_id = auth.uid()
    AND company_id = public.current_user_company_id()
  );

CREATE POLICY jobs_driver_update ON public.jobs
  FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'driver'
    AND assigned_driver_id = auth.uid()
    AND company_id = public.current_user_company_id()
  )
  WITH CHECK (
    public.current_user_role() = 'driver'
    AND assigned_driver_id = auth.uid()
    AND company_id = public.current_user_company_id()
  );

COMMENT ON POLICY jobs_admin_all ON public.jobs IS 'v1.1: admins access all company jobs';
COMMENT ON POLICY jobs_driver_select ON public.jobs IS 'v1.1: drivers read only assigned jobs';
COMMENT ON POLICY jobs_driver_update ON public.jobs IS 'v1.1: drivers update only assigned jobs — field whitelist enforced in lib/server/jobs.ts';
