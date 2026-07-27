import { fail, redirect } from '@sveltejs/kit';

import { isAdminPassword, setAdminSession } from '$lib/server/adminAuth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const password = String(formData.get('password') ?? '');

		if (!password) {
			return fail(400, { error: 'Unesite admin lozinku.' });
		}

		if (!isAdminPassword(password)) {
			return fail(401, { error: 'Pogrešna lozinka.' });
		}

		setAdminSession(cookies);
		redirect(303, '/admin');
	}
};
