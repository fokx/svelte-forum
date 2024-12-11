import urlJoin from 'url-join';
import { PUBLIC_POST_ID_LENGTH } from '$env/static/public';
import { generateRandomString } from '@oslojs/crypto/random';

import { PUBLIC_AVATAR_DEFAULT_URL, PUBLIC_DISCOURSE_HOST } from '$env/static/public';
import { dbd } from '$lib/dbd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export async function post_url(
	url: string,
	body: string
) {
	let dbdc = await dbd.cache.toCollection().last();

	const headers = {
		'Content-Type': 'application/json',
		'Api-Key' :dbdc.api_key,
		'Api-Username' : dbdc.api_username,
	};

	const response = await window.fetch(urlJoin(PUBLIC_DISCOURSE_HOST, url), {
		headers: headers,
		body: body,
		method: 'POST'
		// referrerPolicy: 'no-referrer'
	});
	return response;
}

export async function get_url(url: string, params = {}) {
	let dbdc = await dbd.cache.toCollection().last();

	let u = new URL(urlJoin(PUBLIC_DISCOURSE_HOST, url));
	u.search = new URLSearchParams(params);
	const response = await fetch(u, {
		headers: {
			'Api-Key': dbdc.api_key,
			'Api-Username': dbdc.api_username
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

export async function update_local_categories() {
	let response = await get_url('/categories.json');
	if (response.status === 200) {
		response = await response.json();
		let categories = response.category_list.categories;
		for (let cat of categories) {
			dbd.categories.put({
				id: cat.id,
				name: cat.name,
				color: cat.color,
				text_color: cat.text_color,
				slug: cat.slug,
				topic_count: cat.topic_count,
				post_count: cat.post_count,
				position: cat.position,
				description: cat.description,
				topic_url: cat.topic_url
			});
		}
	}
}
export async function update_local_topic(username:string, api_key:string, topic_id:number) {
	let response = await get_url(`/t/${topic_id}.json`);
	if (response.status === 200) {
		response = await response.json();
		console.log(response);
		let posts = response.post_stream.posts;
		let [main_post] = posts.filter((p) => p.post_number === 1);
		for (let post of posts) {
			dbd.posts.put({
				id: post.id,
				cooked: post.cooked,
				post_number: post.post_number,
				topic_id: post.topic_id,
				user_id: post.user_id,
				reply_to_post_number: post.reply_to_post_number,
				reply_count: post.reply_count,
				created_at: post.created_at,
				deleted_at: post.deleted_at,
				updated_at: post.updated_at,
				is_main_post: post.post_number === 1,
				main_post_id: main_post.id,
				reply_to_post_id: posts.filter((p) => p.post_number === post.reply_to_post_number)[0]?.id,
			});
		}
	}
}

const random = {
	read(bytes) {
		crypto.getRandomValues(bytes);
	}
};

export function GenerateId(length) {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
	return generateRandomString(random, alphabet, length);
}

export function GeneratePostId() {
	return GenerateId(PUBLIC_POST_ID_LENGTH);
}

export function display_time(d) {
	dayjs.extend(relativeTime);
	return dayjs(dayjs(d)).fromNow();
}
