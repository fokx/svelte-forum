import type { Handle } from '@sveltejs/kit'; // import * as auth from '$lib/server/auth.js';
import {
	type DiscourseUserFromCookie,
	GetUserApiKeyCreateIfNotExists,
	ReadDiscourseUser
} from '$lib/discourse';
import { DISCOURSE_COOKIE_NAME } from '$env/static/private';

const handleAuth: Handle = async ({ event, resolve }) => {
	// const sessionToken = event.cookies.get(auth.sessionCookieName);
	// if (!sessionToken) {
	// 	event.locals.user = null;
	// 	event.locals.session = null;
	// 	return resolve(event);
	// }
	//
	// const { session, user } = await auth.validateSessionToken(sessionToken);
	// if (session) {
	// 	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	// } else {
	// 	auth.deleteSessionTokenCookie(event);
	// }
	//
	// event.locals.user = user;
	// event.locals.session = session;
	//
	// return resolve(event);
	if (!event.locals.user) {
		const ext_cookie = event.cookies.get(DISCOURSE_COOKIE_NAME);
		if (ext_cookie) {
			const user: DiscourseUserFromCookie | undefined = await ReadDiscourseUser(ext_cookie);
			event.locals.user = user;
			if (user) {
				if (!event.locals.api_key) {
					event.locals.api_key = await GetUserApiKeyCreateIfNotExists(user.id);
				}
			}
		}
	}
	return resolve(event);
};

export const handle: Handle = handleAuth;
