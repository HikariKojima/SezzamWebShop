import { redirect, type RequestHandler } from '@sveltejs/kit';

import { clearAdminSession } from '$lib/server/adminAuth';

export const POST: RequestHandler = ({ cookies }) => {
	clearAdminSession(cookies);
	redirect(303, '/admin/login');
};
