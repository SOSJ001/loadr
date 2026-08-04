import { error, json } from '@sveltejs/kit';
import { requireApiJobsAccess } from '$lib/server/auth';
import { fetchOperatorJobDetailPageData } from '$lib/server/operator-job-detail';
import type { RequestHandler } from './$types';

/** GET /api/v1/jobs/operator-detail/:id — operator job detail for /jobs/[id] page load */
export const GET: RequestHandler = async (event) => {
	const profile = requireApiJobsAccess(event);
	if (profile instanceof Response) return profile;

	if (profile.role !== 'admin') {
		error(404, 'Not found');
	}

	let plan = 'free';
	if (profile.company_id) {
		const { data: company } = await event.locals.supabase
			.from('companies')
			.select('plan')
			.eq('id', profile.company_id)
			.single();

		if (company) {
			plan = company.plan;
		}
	}

	const preview = event.url.searchParams.get('preview');

	try {
		const pageData = await fetchOperatorJobDetailPageData(
			event.locals.supabase,
			profile,
			event.params.id,
			plan,
			preview
		);

		if (!pageData) {
			error(404, 'Not found');
		}

		return json({ pageData });
	} catch (err) {
		console.error('[loadr] operator job detail failed:', event.params.id, err);
		error(500, 'Failed to load job detail');
	}
};
