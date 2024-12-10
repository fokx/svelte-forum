import urlJoin from 'url-join';

import { PUBLIC_AVATAR_DEFAULT_URL, PUBLIC_DISCOURSE_HOST } from '$env/static/public';

export async function post_url(
	api_username: string = '',
	api_key: string = '',
	url: string,
	body: string
) {
	const headers = {
		'Content-Type': 'application/json'
	};
	if (api_key) {
		headers['Api-Key'] = api_key;
		headers['Api-Username'] = api_username;
	}
	const response = await window.fetch(urlJoin(PUBLIC_DISCOURSE_HOST, url), {
		headers: headers,
		body: body,
		method: 'POST'
		// referrerPolicy: 'no-referrer'
	});
	return response;
}

export async function get_url(api_username: string, api_key: string, url: string, params = {}) {
	let u = new URL(urlJoin(PUBLIC_DISCOURSE_HOST, url));
	u.search = new URLSearchParams(params);
	const response = await fetch(u, {
		headers: {
			'Api-Key': api_key,
			'Api-Username': api_username
		}
	});
	return response;
}

export function assemble_avatar_full_url(avatar_template: string) {
	if (avatar_template === null || avatar_template === undefined) {
		return PUBLIC_AVATAR_DEFAULT_URL;
	}
	if (avatar_template.startsWith('/letter_avatar_proxy')) {
		return urlJoin(PUBLIC_DISCOURSE_HOST, avatar_template.replace('{size}', '288'));
	} else if (avatar_template.includes('{size}')) {
		return urlJoin(PUBLIC_DISCOURSE_HOST, avatar_template.replace('{size}', '288'));
	} else {
		return urlJoin(PUBLIC_DISCOURSE_HOST, avatar_template);
	}
}

export interface DiscourseUser {
	id: number;
	username: string;
	name: string;
	admin: boolean;
	moderator: boolean;
	trust_level: number;
	avatar_template: string;
	title: string;
	groups: string[];
	locale: string;
	silenced_till: number | null;
	staged: boolean;
	active: boolean;
	created_at: number;
	updated_at: number;
}
