import { redirect, type ServerLoadEvent } from '@sveltejs/kit';

import { isAdminSession } from '$lib/server/adminAuth';

export function load({ cookies, url }: ServerLoadEvent) {
	const isLoggedIn = isAdminSession(cookies);

	if (!isLoggedIn && url.pathname !== '/admin/login') {
		redirect(303, '/admin/login');
	}

	if (isLoggedIn && url.pathname === '/admin/login') {
		redirect(303, '/admin');
	}

	return { isLoggedIn };
}
