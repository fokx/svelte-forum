import urlJoin from 'url-join';
import {
	PUBLIC_AVATAR_DEFAULT_URL,
	PUBLIC_DISCOURSE_HOST,
	PUBLIC_POST_ID_LENGTH
} from '$env/static/public';
import { generateRandomString } from '@oslojs/crypto/random';
import { dbb } from '$lib/dbb';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

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

export async function post_url(url: string, body: string) {
	const dbdc = await dbb.cache.toCollection().last();

	const headers = {
		'Content-Type': 'application/json',
		'Api-Key': dbdc.api_key,
		'Api-Username': dbdc.api_username
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
	const dbdc = await dbb.cache.toCollection().last();

	const u = new URL(urlJoin(PUBLIC_DISCOURSE_HOST, url));
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
	if (avatar_template === undefined || avatar_template === null || avatar_template === '') {
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
		const categories = response.category_list.categories;
		for (const cat of categories) {
			dbb.categories.put({
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

export async function update_local_topic(topic_id: number) {
	let response = await get_url(`/t/${topic_id}.json`);
	if (response.status === 200) {
		response = await response.json();
		const posts = response.post_stream.posts;
		const [main_post] = posts.filter((p) => p.post_number === 1);
		const ret = [];
		for (const post of posts) {
			const p = {
				id: post.id,
				cooked: post.cooked,
				post_number: post.post_number,
				topic_id: post.topic_id,
				reply_to_post_number: post.reply_to_post_number,
				reply_count: post.reply_count,
				created_at: post.created_at,
				deleted_at: post.deleted_at,
				updated_at: post.updated_at,
				is_main_post: post.post_number === 1,
				main_post_id: main_post.id,
				reply_to_post_id: posts.filter((p) => p.post_number === post.reply_to_post_number)[0]?.id,
				title: post.post_number === 1 ? response.title : null,
				user_id: post.user_id,
				// TODO: check how to remove this redundant info
				username: post.username,
				avatar_template: post.avatar_template
			};
			dbb.posts.put(p);
			ret.push(p);
		}
		return ret;
	}
}

export async function update_latest_topics() {
	let response = await get_url(`/latest.json`);
	if (response.status === 200) {
		response = await response.json();
		const topics = response.topic_list.topics;
		let ret = [];
		for (const topic of topics) {
			// TODO: add global id in Discourse
			const id = GeneratePostId();
			const p = {
				id: id,
				title: topic.title,
				reply_count: topic.reply_count,
				post_number: 1,
				topic_id: topic.id,
				reply_to_post_number: null,
				created_at: topic?.created_at,
				deleted_at: topic?.deleted_at,
				updated_at: topic?.updated_at,
				// main_post_id: ,
				is_main_post: true,
				reply_to_post_id: id,
				// user_id: topic.user_id,
				// username: topic.username,
				// avatar_template: topic.avatar_template,
				// topic specic field
				fancy_title: topic.fancy_title,
				posts_count: topic.posts_count,
				excerpt: topic.excerpt,
				image_url: topic.image_url,
				last_posted_at: topic.last_posted_at,
				last_poster_username: topic.last_poster_username,
				bumped_at: topic.bumped_at
			};
			dbb.posts.put(p);
			ret.push(p);
		}
		return ret;
	}
}

export async function get_avatar_url_by_username(username) {
	// TODO: download user info on init visit asynchronously
	const user = await dbb.users.where('username').equals(username).first();
	if (user) {
		return user.avatar_template;
	}
	let response = await get_url(`/u/${username}.json`);
	if (response.status === 200) {
		response = await response.json();
		let user = response.user;
		dbb.users.put({
			id: user.id,
			username: user.username,
			name: user.name,
			admin: user.admin,
			staged: user.staged,
			active: user.active,
			moderator: user.moderator,
			trust_level: user.trust_level,
			avatar_template: user.avatar_template,
			title: user.title,
			groups: user.groups,
			locale: user.locale,
			silenced_till: user.silenced_till,
			created_at: user.created_at,
			updated_at: user.updated_at
		});
		return user.avatar_template;
	}
}
