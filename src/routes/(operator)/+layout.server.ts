import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.session) {
    redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
  }

  if (locals.profile?.role !== 'admin') {
    redirect(303, '/login');
  }

  let companyName = 'Your company';
  let plan = 'free';

  if (locals.profile?.company_id) {
    const { data: company } = await locals.supabase
      .from('companies')
      .select('name, plan')
      .eq('id', locals.profile.company_id)
      .single();

    if (company) {
      companyName = company.name;
      plan = company.plan;
    }
  }

  return {
    session: locals.session,
    profile: locals.profile,
    companyName,
    plan
  };
};
