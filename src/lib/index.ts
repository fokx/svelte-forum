import urlJoin from 'url-join';

import { PUBLIC_DISCOURSE_HOST } from '$env/static/public';

export async function post_url(api_key: string, api_username: string, url: string, body: string) {
	const response = await fetch(urlJoin(PUBLIC_DISCOURSE_HOST, url), {
		headers: {
			'Api-Key': api_key,
			'Api-Username': api_username,
			'Content-Type': 'application/json'
		},
		body: body,
		method: 'POST'
	});

	return await response.json();
}

export async function get_url(api_key: string, api_username: string, url: string) {
	const response = await fetch(urlJoin(PUBLIC_DISCOURSE_HOST, url), {
		headers: {
			'Api-Key': api_key,
			'Api-Username': api_username
		}
	});

	return await response.json();
}
