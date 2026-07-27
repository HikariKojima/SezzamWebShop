import { DATABASE_URL } from '$env/static/private';

import { createDatabaseClient } from './client';

export const { client, db } = createDatabaseClient(DATABASE_URL);
