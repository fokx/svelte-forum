import urlJoin from 'url-join';

import { PUBLIC_DISCOURSE_HOST } from '$env/static/public';

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
	console.log(u.toString());
	const response = await fetch(u, {
		headers: {
			'Api-Key': api_key,
			'Api-Username': api_username
		}
	});
	return response;
}
