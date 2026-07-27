import { env } from '$env/dynamic/private';
import { redirect, type Cookies } from '@sveltejs/kit';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ADMIN_SESSION_COOKIE = 'sezzam_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getAdminPassword() {
	const password = env.ADMIN_PASSWORD;
	if (!password) {
		throw new Error('ADMIN_PASSWORD is required');
	}

	return password;
}

function getSessionSecret() {
	const secret = env.ADMIN_SESSION_SECRET;
	if (!secret || secret.length < 32) {
		throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');
	}

	return secret;
}

function signSessionPayload(payload: string) {
	return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function safelyCompare(first: string, second: string) {
	const firstBuffer = Buffer.from(first);
	const secondBuffer = Buffer.from(second);

	if (firstBuffer.length !== secondBuffer.length) return false;
	return timingSafeEqual(firstBuffer, secondBuffer);
}

export function isAdminPassword(value: string) {
	return safelyCompare(
		createHmac('sha256', getSessionSecret()).update(value).digest('hex'),
		createHmac('sha256', getSessionSecret()).update(getAdminPassword()).digest('hex')
	);
}

export function setAdminSession(cookies: Cookies) {
	const payload = `${Date.now()}.${randomBytes(24).toString('base64url')}`;
	const signature = signSessionPayload(payload);

	cookies.set(ADMIN_SESSION_COOKIE, `${payload}.${signature}`, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: env.NODE_ENV === 'production',
		maxAge: SESSION_MAX_AGE_SECONDS
	});
}

export function clearAdminSession(cookies: Cookies) {
	cookies.delete(ADMIN_SESSION_COOKIE, { path: '/' });
}

export function isAdminSession(cookies: Cookies) {
	const session = cookies.get(ADMIN_SESSION_COOKIE);
	if (!session) return false;

	const parts = session.split('.');
	if (parts.length !== 3) return false;

	const [createdAtValue, nonce, signature] = parts;
	const createdAt = Number(createdAtValue);
	if (!Number.isInteger(createdAt)) return false;

	const ageMs = Date.now() - createdAt;
	if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) return false;

	const expectedSignature = signSessionPayload(`${createdAtValue}.${nonce}`);
	return safelyCompare(signature, expectedSignature);
}

export function requireAdminSession(cookies: Cookies) {
	if (!isAdminSession(cookies)) {
		redirect(303, '/admin/login');
	}
}
