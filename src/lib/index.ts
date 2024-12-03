// place files you want to import through the `$lib` alias in this folder.
import urlJoin from 'url-join';
import {
	DISCOURSE_ADMIN_API_KEY,
	DISCOURSE_ADMIN_API_KEY_USERNAME,
	DISCOURSE_HOST
} from '$env/static/private';

export async function post_url(url: string, username: string) {
	const response = await fetch(urlJoin(DISCOURSE_HOST, url), {
		headers: {
			'Api-Key': DISCOURSE_ADMIN_API_KEY,
			'Api-Username': DISCOURSE_ADMIN_API_KEY_USERNAME,
			'Content-Type': 'application/json'
		},
		body: `{"key":{"description":"user-api-key","username":"${username}"}}`,
		method: 'POST'
	});

	return await response.json();
}

export async function admin_get_url(url: string) {
	const response = await fetch(urlJoin(DISCOURSE_HOST, url), {
		headers: {
			'Api-Key': DISCOURSE_ADMIN_API_KEY,
			'Api-Username': DISCOURSE_ADMIN_API_KEY_USERNAME
		}
	});

	return await response.json();
}
