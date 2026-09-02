import { env } from '$env/dynamic/private';
import { createDatabaseClient } from './client';

let instance: ReturnType<typeof createDatabaseClient> | null = null;

export function getDbInstance() {
	if (!instance) {
		const url = env.DATABASE_URL || process.env.DATABASE_URL;
		if (!url) {
			throw new Error('DATABASE_URL is required in environment variables');
		}
		instance = createDatabaseClient(url);
	}
	return instance;
}

export const db = new Proxy({} as ReturnType<typeof createDatabaseClient>['db'], {
	get(_target, prop) {
		const activeDb = getDbInstance().db;
		const value = Reflect.get(activeDb, prop);
		if (typeof value === 'function') {
			return value.bind(activeDb);
		}
		return value;
	}
});

export const client = new Proxy({} as ReturnType<typeof createDatabaseClient>['client'], {
	get(_target, prop) {
		const activeClient = getDbInstance().client;
		const value = Reflect.get(activeClient, prop);
		if (typeof value === 'function') {
			return value.bind(activeClient);
		}
		return value;
	}
});
