-- Soft-delete for drivers — preserve job history and driver name lookups

ALTER TABLE public.users
  ADD COLUMN removed_at timestamptz;

DROP POLICY IF EXISTS users_admin_delete ON public.users;

CREATE INDEX users_active_drivers_idx ON public.users (company_id, role)
  WHERE removed_at IS NULL AND role = 'driver';

COMMENT ON COLUMN public.users.removed_at IS 'When set, driver is removed from active list and cannot log in';
