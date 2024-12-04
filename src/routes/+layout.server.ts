import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts, users } from '$lib/server/db/schema';
import { asc, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	let cloud_posts, cloud_users;
	const user = locals.user;
	const api_key = locals.api_key;
	const not_logged_in = '/not-logged-in';
	console.log(user);
	if (user && url.pathname === not_logged_in) {
		return redirect(302, '/');
	}
	if (!user && url.pathname !== not_logged_in) {
		return redirect(302, not_logged_in);
	} else {
		cloud_posts = await db.select().from(posts).orderBy(desc(posts.id));
		cloud_users = await db.select().from(users).orderBy(asc(users.id));
	}
	return {
		user: user,
		api_key: api_key,
		cloud_posts: cloud_posts,
		cloud_users: cloud_users
	};
};
