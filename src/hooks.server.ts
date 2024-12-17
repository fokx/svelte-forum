import type { Handle } from '@sveltejs/kit'; // import * as auth from '$lib/server/auth.js';
import { ReadDiscourseUser } from '$lib/server/discourse';
import { DISCOURSE_COOKIE_NAME } from '$env/static/private';
import { eq } from 'drizzle-orm';
import { CreateDiscourseUserApiKeyAndReturnKey } from './lib/server/discourse';
import { dbs } from '$lib/server/db';
import { discourse_api_keys } from '$lib/server/db/schema';

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.locals.user) {
		const ext_cookie = event.cookies.get(DISCOURSE_COOKIE_NAME);

		// assert `user` is always not null
		// if not logged-in, the user will be 'guest' user
		const user = await ReadDiscourseUser(ext_cookie);

		// when a user logs out, local `api_key` shall be removed
		if (event.locals.user && event.locals.user.id !== user.id) {
			event.locals.api_key = undefined;
		}
		event.locals.user = user;
		if (event.locals.api_key === undefined) {
			const result = await dbs
				.select()
				.from(discourse_api_keys)
				// TODO: add notnull filter
				.where(eq(discourse_api_keys.user_id, user.id))
				.limit(1);
			let key: string;
			if (result.length) {
				key = result[0].key;
			} else {
				// no api key found in application db, create one
				// as this is done on server, this should be fast
				// TODO: check how this affects performance in real world.
				key = await CreateDiscourseUserApiKeyAndReturnKey(user);
			}
			event.locals.api_key = key;
		}
	}
	return resolve(event);
};
