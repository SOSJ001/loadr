-- Company verification fields + Rule 4 verification gating (jobs writes, driver invites)

-- ---------------------------------------------------------------------------
-- companies: Companies House verification columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.companies
  ADD COLUMN verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('verified', 'pending', 'rejected')),
  ADD COLUMN companies_house_number text,
  ADD COLUMN registered_name text;

-- ---------------------------------------------------------------------------
-- RLS helper: Rule 4 — company must be verified for gated writes
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_company_verified()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies c
    INNER JOIN public.users u ON u.company_id = c.id
    WHERE u.id = auth.uid()
      AND c.verification_status = 'verified'
  )
$$;

-- ---------------------------------------------------------------------------
-- jobs: split admin policy so reads work while pending; writes require verified
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS jobs_admin_all ON public.jobs;

CREATE POLICY jobs_admin_select ON public.jobs
  FOR SELECT TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY jobs_admin_insert ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = public.current_user_company_id()
    AND public.is_admin()
    AND public.is_company_verified()
  );

CREATE POLICY jobs_admin_update ON public.jobs
  FOR UPDATE TO authenticated
  USING (
    company_id = public.current_user_company_id()
    AND public.is_admin()
    AND public.is_company_verified()
  )
  WITH CHECK (
    company_id = public.current_user_company_id()
    AND public.is_admin()
    AND public.is_company_verified()
  );

CREATE POLICY jobs_admin_delete ON public.jobs
  FOR DELETE TO authenticated
  USING (
    company_id = public.current_user_company_id()
    AND public.is_admin()
    AND public.is_company_verified()
  );

COMMENT ON POLICY jobs_admin_insert ON public.jobs IS 'Rule 4: job creation requires verified company';
COMMENT ON POLICY jobs_admin_update ON public.jobs IS 'Rule 4: job updates require verified company';
COMMENT ON POLICY jobs_admin_delete ON public.jobs IS 'Rule 4: job deletion requires verified company';

-- ---------------------------------------------------------------------------
-- users: Rule 4 — driver invites (INSERT) require verified company
-- Self-registration (users_insert, id = auth.uid()) is unchanged.
-- ---------------------------------------------------------------------------

CREATE POLICY users_admin_invite_insert ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = public.current_user_company_id()
    AND public.is_admin()
    AND public.is_company_verified()
    AND role = 'driver'
  );

COMMENT ON POLICY users_admin_invite_insert ON public.users IS 'Rule 4: driver invites require verified company';

-- Resend-invite updates driver rows — RESTRICTIVE policy preserves Rule 3 users_admin_update
CREATE POLICY users_rule4_block_driver_writes ON public.users
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (
    role != 'driver'
    OR id = auth.uid()
    OR public.is_company_verified()
    OR NOT public.is_admin()
  );

COMMENT ON POLICY users_rule4_block_driver_writes ON public.users IS 'Rule 4: admin cannot update driver rows (e.g. resend invite) until company verified';
