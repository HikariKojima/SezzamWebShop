import { fail } from '@sveltejs/kit';
import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema';
import { getSiteSettings, uploadBannerImage } from '$lib/server/siteSettings';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdminSession(cookies);
	const settings = await getSiteSettings();
	return { settings };
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();

		const heroTagline = String(formData.get('heroTagline') ?? '').trim();
		const heroTitle = String(formData.get('heroTitle') ?? '').trim();
		const heroSubtitle = String(formData.get('heroSubtitle') ?? '').trim();
		let heroImageUrl = String(formData.get('heroImageUrl') ?? '').trim() || null;

		const spotlightQuote = String(formData.get('spotlightQuote') ?? '').trim();
		const spotlightTitle = String(formData.get('spotlightTitle') ?? '').trim();
		const spotlightSubtitle = String(formData.get('spotlightSubtitle') ?? '').trim();
		let spotlightImageUrl = String(formData.get('spotlightImageUrl') ?? '').trim() || null;

		const contactPhone = String(formData.get('contactPhone') ?? '').trim();
		const contactEmail = String(formData.get('contactEmail') ?? '').trim();

		const heroFile = formData.get('heroImageFile');
		if (
			heroFile &&
			typeof heroFile === 'object' &&
			'size' in heroFile &&
			(heroFile as File).size > 0
		) {
			const uploaded = await uploadBannerImage(heroFile as File, 'hero');
			if (uploaded) heroImageUrl = uploaded;
		}

		const spotlightFile = formData.get('spotlightImageFile');
		if (
			spotlightFile &&
			typeof spotlightFile === 'object' &&
			'size' in spotlightFile &&
			(spotlightFile as File).size > 0
		) {
			const uploaded = await uploadBannerImage(spotlightFile as File, 'showcase');
			if (uploaded) spotlightImageUrl = uploaded;
		}

		if (!heroTitle || !heroSubtitle || !spotlightQuote) {
			return fail(400, { error: 'Molimo popunite obavezna polja (Naslov, opis i citat).' });
		}

		await db
			.insert(siteSettings)
			.values({
				id: 'homepage',
				heroTagline,
				heroTitle,
				heroSubtitle,
				heroImageUrl,
				spotlightQuote,
				spotlightImageUrl,
				spotlightTitle,
				spotlightSubtitle,
				contactPhone,
				contactEmail,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: siteSettings.id,
				set: {
					heroTagline,
					heroTitle,
					heroSubtitle,
					heroImageUrl,
					spotlightQuote,
					spotlightImageUrl,
					spotlightTitle,
					spotlightSubtitle,
					contactPhone,
					contactEmail,
					updatedAt: new Date()
				}
			});

		return { success: true, message: 'Početna stranica je uspješno ažurirana!' };
	}
};
