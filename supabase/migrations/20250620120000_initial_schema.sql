-- Loadr Phase 1 — Initial Schema
-- Version 1.0 | Type B1 Transport Carrier Job Management

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  logo_url text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('admin', 'driver')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  last_active_at timestamptz,
  invite_token text,
  invite_expires_at timestamptz,
  CONSTRAINT users_driver_phone_required CHECK (role = 'admin' OR phone IS NOT NULL)
);

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  registration text NOT NULL,
  type text NOT NULL CHECK (type IN ('van', 'lorry', 'hgv', 'other')),
  make text,
  model text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reference text NOT NULL,
  pickup_address text NOT NULL,
  pickup_lat numeric(10, 7) NOT NULL,
  pickup_lng numeric(10, 7) NOT NULL,
  dropoff_address text NOT NULL,
  dropoff_lat numeric(10, 7) NOT NULL,
  dropoff_lng numeric(10, 7) NOT NULL,
  scheduled_at timestamptz NOT NULL,
  assigned_driver_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete', 'attempted')),
  notes text,
  job_value numeric(12, 2),
  fuel_cost numeric(12, 2),
  started_at timestamptz,
  completed_at timestamptz,
  has_return_leg boolean,
  return_leg_empty boolean,
  CONSTRAINT jobs_reference_unique UNIQUE (reference)
);

CREATE TABLE public.proof_of_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  type text NOT NULL CHECK (type IN ('photo', 'signature')),
  file_url text NOT NULL,
  recipient_name text,
  completed_at timestamptz NOT NULL,
  gps_lat numeric(10, 7),
  gps_lng numeric(10, 7),
  blockchain_hash text,
  blockchain_confirmed boolean NOT NULL DEFAULT false,
  CONSTRAINT proof_of_delivery_job_unique UNIQUE (job_id)
);

CREATE TABLE public.job_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  old_status text NOT NULL,
  new_status text NOT NULL,
  note text
);

CREATE TABLE public.route_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  origin_address text NOT NULL,
  origin_lat numeric(10, 7) NOT NULL,
  origin_lng numeric(10, 7) NOT NULL,
  destination_address text NOT NULL,
  destination_lat numeric(10, 7) NOT NULL,
  destination_lng numeric(10, 7) NOT NULL,
  vehicle_type text NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  time_of_day text NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  return_leg_empty boolean,
  blockchain_hash text,
  blockchain_confirmed boolean NOT NULL DEFAULT false,
  CONSTRAINT route_data_job_unique UNIQUE (job_id)
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text,
  plan text NOT NULL CHECK (plan IN ('free', 'pro')),
  price_gbp numeric(12, 2),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  CONSTRAINT subscriptions_company_unique UNIQUE (company_id)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('job_complete', 'delivery_attempted', 'driver_activated')),
  title text NOT NULL,
  body text NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz
);

CREATE TABLE public.blockchain_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reference_type text NOT NULL CHECK (reference_type IN ('proof_of_delivery', 'route_data')),
  reference_id uuid NOT NULL,
  sha256_hash text NOT NULL,
  solana_transaction_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmed_at timestamptz,
  retry_count integer NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_vehicles_company_id ON public.vehicles(company_id);
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_reference ON public.jobs(reference);
CREATE INDEX idx_jobs_assigned_driver_id ON public.jobs(assigned_driver_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_scheduled_at ON public.jobs(scheduled_at);
CREATE INDEX idx_proof_of_delivery_job_id ON public.proof_of_delivery(job_id);
CREATE INDEX idx_proof_of_delivery_company_id ON public.proof_of_delivery(company_id);
CREATE INDEX idx_job_status_history_job_id ON public.job_status_history(job_id);
CREATE INDEX idx_route_data_company_id ON public.route_data(company_id);
CREATE INDEX idx_notifications_user_id_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX idx_blockchain_receipts_company_id_status ON public.blockchain_receipts(company_id, status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- ---------------------------------------------------------------------------
-- Trigger: auto-generate unique job reference
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_job_reference()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
  attempts integer := 0;
BEGIN
  IF NEW.reference IS NOT NULL AND NEW.reference <> '' THEN
    RETURN NEW;
  END IF;

  LOOP
    candidate := '#' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
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

CREATE TRIGGER trg_jobs_set_reference
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_reference();

-- ---------------------------------------------------------------------------
-- Trigger: derive time_of_day from scheduled_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.derive_time_of_day(ts timestamptz)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  hour integer;
BEGIN
  hour := EXTRACT(HOUR FROM ts AT TIME ZONE 'UTC');
  IF hour >= 5 AND hour < 12 THEN
    RETURN 'morning';
  ELSIF hour >= 12 AND hour < 17 THEN
    RETURN 'afternoon';
  ELSE
    RETURN 'evening';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.derive_day_of_week(ts timestamptz)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN lower(trim(to_char(ts AT TIME ZONE 'UTC', 'Day')));
END;
$$;

-- ---------------------------------------------------------------------------
-- Trigger: job status history on status change
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_job_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.job_status_history (
      job_id,
      company_id,
      changed_by,
      old_status,
      new_status
    ) VALUES (
      NEW.id,
      NEW.company_id,
      COALESCE(auth.uid(), NEW.assigned_driver_id),
      OLD.status,
      NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_jobs_status_history
  AFTER UPDATE OF status ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.record_job_status_change();

-- ---------------------------------------------------------------------------
-- Trigger: sync route_data from jobs
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_route_data_from_job()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vehicle_type text;
BEGIN
  IF NEW.assigned_vehicle_id IS NOT NULL THEN
    SELECT type INTO v_vehicle_type
    FROM public.vehicles
    WHERE id = NEW.assigned_vehicle_id;
  END IF;

  IF v_vehicle_type IS NULL THEN
    v_vehicle_type := 'other';
  END IF;

  INSERT INTO public.route_data (
    job_id,
    company_id,
    origin_address,
    origin_lat,
    origin_lng,
    destination_address,
    destination_lat,
    destination_lng,
    vehicle_type,
    day_of_week,
    time_of_day,
    return_leg_empty
  ) VALUES (
    NEW.id,
    NEW.company_id,
    NEW.pickup_address,
    NEW.pickup_lat,
    NEW.pickup_lng,
    NEW.dropoff_address,
    NEW.dropoff_lat,
    NEW.dropoff_lng,
    v_vehicle_type,
    public.derive_day_of_week(NEW.scheduled_at),
    public.derive_time_of_day(NEW.scheduled_at),
    NEW.return_leg_empty
  )
  ON CONFLICT (job_id) DO UPDATE SET
    origin_address = EXCLUDED.origin_address,
    origin_lat = EXCLUDED.origin_lat,
    origin_lng = EXCLUDED.origin_lng,
    destination_address = EXCLUDED.destination_address,
    destination_lat = EXCLUDED.destination_lat,
    destination_lng = EXCLUDED.destination_lng,
    vehicle_type = EXCLUDED.vehicle_type,
    day_of_week = EXCLUDED.day_of_week,
    time_of_day = EXCLUDED.time_of_day,
    return_leg_empty = EXCLUDED.return_leg_empty;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_jobs_sync_route_data
  AFTER INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_route_data_from_job();

-- ---------------------------------------------------------------------------
-- RLS helper functions (after users table exists)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_receipts ENABLE ROW LEVEL SECURITY;

-- companies
CREATE POLICY companies_select ON public.companies
  FOR SELECT TO authenticated
  USING (id = public.current_user_company_id());

CREATE POLICY companies_insert ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY companies_update ON public.companies
  FOR UPDATE TO authenticated
  USING (id = public.current_user_company_id() AND public.is_admin())
  WITH CHECK (id = public.current_user_company_id() AND public.is_admin());

-- users
CREATE POLICY users_admin_select ON public.users
  FOR SELECT TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY users_driver_select ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid() AND public.current_user_role() = 'driver');

CREATE POLICY users_insert ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY users_admin_update ON public.users
  FOR UPDATE TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin())
  WITH CHECK (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY users_driver_update ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid() AND public.current_user_role() = 'driver')
  WITH CHECK (id = auth.uid() AND public.current_user_role() = 'driver');

-- vehicles
CREATE POLICY vehicles_admin_all ON public.vehicles
  FOR ALL TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin())
  WITH CHECK (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY vehicles_driver_select ON public.vehicles
  FOR SELECT TO authenticated
  USING (company_id = public.current_user_company_id() AND public.current_user_role() = 'driver');

-- jobs
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

-- proof_of_delivery
CREATE POLICY pod_admin_all ON public.proof_of_delivery
  FOR ALL TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin())
  WITH CHECK (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY pod_driver_select ON public.proof_of_delivery
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'driver'
    AND company_id = public.current_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = proof_of_delivery.job_id
        AND j.assigned_driver_id = auth.uid()
    )
  );

CREATE POLICY pod_driver_insert ON public.proof_of_delivery
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() = 'driver'
    AND driver_id = auth.uid()
    AND company_id = public.current_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = proof_of_delivery.job_id
        AND j.assigned_driver_id = auth.uid()
    )
  );

-- job_status_history
CREATE POLICY job_status_history_admin_select ON public.job_status_history
  FOR SELECT TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY job_status_history_driver_select ON public.job_status_history
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'driver'
    AND company_id = public.current_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_status_history.job_id
        AND j.assigned_driver_id = auth.uid()
    )
  );

-- route_data: RLS enabled, no client policies (service role only)

-- subscriptions
CREATE POLICY subscriptions_admin_select ON public.subscriptions
  FOR SELECT TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin());

-- notifications
CREATE POLICY notifications_admin_all ON public.notifications
  FOR ALL TO authenticated
  USING (company_id = public.current_user_company_id() AND public.is_admin())
  WITH CHECK (company_id = public.current_user_company_id() AND public.is_admin());

CREATE POLICY notifications_user_select ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_user_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- blockchain_receipts: no client access (service role only)
