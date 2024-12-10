// place files you want to import through the `$lib` alias in this folder.
import urlJoin from 'url-join';
import {
	DISCOURSE_ADMIN_API_KEY,
	DISCOURSE_ADMIN_API_KEY_USERNAME,
} from '$env/static/private';

import {PUBLIC_DISCOURSE_HOST} from '$env/static/public';

export async function admin_post_url(url: string, body: string) {
	const response = await fetch(urlJoin(PUBLIC_DISCOURSE_HOST, url), {
		headers: {
			'Api-Key': DISCOURSE_ADMIN_API_KEY,
			'Api-Username': DISCOURSE_ADMIN_API_KEY_USERNAME,
			'Content-Type': 'application/json',
			'Accept': 'application/json'

		},
		body: body,
		method: 'POST'
	});

	return await response.json();
}


export async function admin_get_url(url: string) {
	const response = await fetch(urlJoin(PUBLIC_DISCOURSE_HOST, url), {
		headers: {
			'Api-Key': DISCOURSE_ADMIN_API_KEY,
			'Api-Username': DISCOURSE_ADMIN_API_KEY_USERNAME,
		}
	});

	return await response.json();
}
