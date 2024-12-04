import urlJoin from 'url-join';

import { PUBLIC_DISCOURSE_HOST } from '$env/static/public';

export async function post_url(
	url: string,
	body: string,

	api_username: string = '',
api_key: string = '',

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

export async function get_url(url: string, api_key: string, api_username: string) {
	const response = await fetch(urlJoin(PUBLIC_DISCOURSE_HOST, url), {
		headers: {
			'Api-Key': api_key,
			'Api-Username': api_username,
			Accept: 'application/json'
		}
	});

	return await response.json();
}
