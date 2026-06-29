-- Admin delete for driver rows (remove driver from company)

CREATE POLICY users_admin_delete ON public.users
  FOR DELETE TO authenticated
  USING (
    company_id = public.current_user_company_id()
    AND public.is_admin()
    AND role = 'driver'
  );

COMMENT ON POLICY users_admin_delete ON public.users IS 'Admins can remove driver profiles from their company';
