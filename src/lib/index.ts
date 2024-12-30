import urlJoin from 'url-join';
import {
	PUBLIC_AVATAR_DEFAULT_URL,
	PUBLIC_DISCOURSE_HOST,
	PUBLIC_POST_ID_LENGTH
} from '$env/static/public';
import { dbb } from '$lib/dbb';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { page } from '$app/state';
import * as htmlparser2 from "htmlparser2";
import { render as dom_render } from "dom-serializer";
import * as domutils from "domutils";
import hljs from 'highlight.js';
import Highlight from "svelte-highlight";
import EmojiConvertor from 'emoji-js';
const emoji = new EmojiConvertor();
emoji.replace_mode = 'unified';
emoji.img_set = 'google'; // this line seems to have no effect, see https://github.com/iamcal/emoji-data

function generateRandomString(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

export function GeneratePostId() {
	return generateRandomString(PUBLIC_POST_ID_LENGTH);
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
		'Api-Username': encodeURIComponent(dbdc.api_username)
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
			'Api-Username': encodeURIComponent(dbdc.api_username)
		}
	});
	return response;
}

export function assemble_avatar_full_url(avatar_template: string) {
	if (avatar_template === undefined || avatar_template === null || avatar_template === '') {
		return PUBLIC_AVATAR_DEFAULT_URL;
	}
	if (avatar_template.includes('{size}')) {
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
			await dbb.categories.put({
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


export async function update_local_topic_by_discourse_id(topic_id:number) {
	let response = await get_url(`/t/${topic_id}.json`);
	return await update_local_topic(response);
}

export async function update_local_topic_by_external_id(topic_external_id) {
	let response = await get_url(`/t_external_id/${topic_external_id}.json`, {print: true});
	return await update_local_topic(response);
}
async function update_local_topic(response) {
	if (response.status === 200) {
		response = await response.json();
		const posts = response.post_stream.posts;
		// const [main_post] = posts.filter((p) => p.post_number === 1);
		const main_post_id = posts[0].external_id;
		const posts_to_update = [];
		for (const post of posts) {
			const is_main_post = post.post_number === 1;
			let reply_to_post_id = null;
			let reply_to_post_number = null;
			if (!is_main_post) {
				if (post.reply_to_post_number === null) {
					reply_to_post_id = main_post_id;
					// when reply directly to original post, reply_to_post_number is null,
					// which is not indexable by IndexedDB, see https://dexie.org/docs/Indexable-Type
					reply_to_post_number = 1;
				} else {
					reply_to_post_id = posts.filter((p) => p.post_number === post.reply_to_post_number)[0]
						?.external_id;
					reply_to_post_number = post.reply_to_post_number;
				}
			}
			const p = {
				id: post.external_id,
				cooked: post.cooked,
				raw: post.raw,
				post_number: post.post_number,
				topic_id: post.topic_id,
				reply_to_post_number: reply_to_post_number,
				reply_count: post.reply_count,
				created_at: post.created_at,
				deleted_at: post.deleted_at,
				updated_at: post.updated_at,
				is_main_post: is_main_post,
				main_post_id: main_post_id,
				reply_to_post_id: reply_to_post_id,
				title: post.post_number === 1 ? emoji.replace_colons(response.title) : null,
				user_id: post.user_id,
				// TODO: check how to remove this redundant info
				username: post.username,
				avatar_template: post.avatar_template
			};
			posts_to_update.push(p);
		}
		await dbb.posts.bulkPut(posts_to_update);
		return posts_to_update;
	}
}

async function update_topics(response) {
	if (response.status === 200) {
		response = await response.json();
		let users_to_update = [];
		let posts_to_update = [];
		if (response.users) {
			for (const user of response.users) {
				users_to_update.push({
					id: user.id,
					username: user.username,
					name: user.name,
					admin: user.admin,
					staged: user?.staged,
					active: user?.active,
					moderator: user.moderator,
					trust_level: user.trust_level,
					avatar_template: user.avatar_template,
					animated_avatar: user?.animated_avatar,
					flair_name: user?.flair_name,
					title: user?.title,
					groups: user?.groups,
					locale: user?.locale,
					silenced_till: user?.silenced_till,
					created_at: user?.created_at,
					updated_at: user?.updated_at
				});
			}

		}
		const topics = response.topic_list.topics;
		for (const topic of topics) {
			let posters = topic.posters;
			let original_poster = posters[0];
			// TODO: add global id in Discourse
			const p = {
				id: topic.external_id,
				title: emoji.replace_colons(topic.title),
				reply_count: topic.reply_count,
				post_number: 1,
				topic_id: topic.external_id,
				reply_to_post_number: 0,
				created_at: topic?.created_at,
				deleted_at: topic?.deleted_at,
				updated_at: topic?.updated_at,
				main_post_id: topic.external_id,
				is_main_post: true,
				reply_to_post_id: 'nil',
				// user_id: topic.user_id,
				// username: topic.username,
				// avatar_template: topic.avatar_template,
				/// topic specic field
				fancy_title: topic?.fancy_title,
				posts_count: topic?.posts_count,
				excerpt: emoji.replace_colons(topic?.excerpt),
				image_url: topic?.image_url,
				last_posted_at: topic?.last_posted_at,
				last_poster_username: topic?.last_poster_username,
				original_poster_user_id: original_poster?.user_id,
				bumped_at: topic?.bumped_at,
				synced_at: new Date(),
			};
			// posts: '&id, topic_id, post_number, reply_to_post_number, last_posted_at', //[topic_id+post_number],[topic_id+reply_to_post_number],
			posts_to_update.push(p);
		}
		await dbb.users.bulkPut(users_to_update);
		await dbb.posts.bulkPut(posts_to_update);
		return posts_to_update;
	}
}
export async function update_latest_topics(page=0) {
	let response = await get_url(`/latest.json`, { no_definitions: true, page: page, order: 'activity'});
	return await update_topics(response);
}

export async function update_user_topics(username: string) {
	let response = await get_url(`/topics/created-by/${username}.json`);
	return await update_topics(response);
}

export async function update_user_replies(username: string) {
	// https://github.com/discourse/discourse/blob/334a2f216f0c365d97bd3d390ca89f195aea9323/app/models/user_action.rb#L16
	let response = await get_url(`/user_actions.json`, { offset: 0, username: username, filter: 5 });
	let posts_to_update = [];
	if (response.status === 200) {
		response = await response.json();
		for (const reply of response.user_actions) {
			const p = {
				id: reply.external_id,
				excerpt: emoji.replace_colons(reply?.excerpt),
				title: emoji.replace_colons(reply.title),
				reply_count: reply.reply_count,
				post_number: reply.post_number,
				reply_id: reply.reply_id,
				reply_to_post_number: reply.reply_to_post_number,
				created_at: reply?.created_at,
				deleted_at: reply?.deleted_at,
				updated_at: reply?.updated_at,
				// main_post_id: ,
				is_main_post: reply.post_number === 1,
				reply_to_post_id: reply?.reply_to_post_external_id,
				// user_id: reply.user_id,
				// username: reply.username,
				// avatar_template: reply.avatar_template,
				/// reply specic field
				// fancy_title: reply?.fancy_title,
				// posts_count: reply?.posts_count,
				// image_url: reply?.image_url,
				// last_posted_at: reply?.last_posted_at,
				// last_poster_username: reply?.last_poster_username,
				acting_username: reply?.acting_username,
				// bumped_at: reply?.bumped_at
			};
			posts_to_update.push(p);
		}
		await dbb.posts.bulkPut(posts_to_update);
		return posts_to_update;
	}
}

export async function get_cached_avatar_url_by_user_id(uid: number) {
	const user = await dbb.users.where('id').equals(uid).first();
	if (user) {
		return user.avatar_template;
	} else {
		return null;
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
		await dbb.users.put({
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




export async function fetch_post_by_external_id(post_external_id) {
	// get `/posts/{id}.json` with  { include_raw: true } will return raw with post
	// while query with external_id does not.
	// should fix this in custom Discourse code
	let response = await get_url(`/posts/by_external_id/${post_external_id}.json`);
	if (response.status === 200) {
		const post = await response.json();
		// TODO: this add another round-trip to the server, which makes loading individual post slow
		// don't await update_local_topic_by_discourse_id may mitigate this issue a bit
		let topic_posts =  update_local_topic_by_discourse_id(post.topic_id);
		return await dbb.posts.get(post_external_id);
	}
}
export function convertHtmlToText(html) {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.innerText;
}

export const scrollable_main_class= 'h-[82vh] max-sm:h-[80vh] overflow-y-scroll';
export function sleep_ms(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms ?? 200));
}

// https://icons.getbootstrap.com/icons/check2-square/
const html_checked_square = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="display: inline bi bi-check2-square" viewBox="0 0 16 16">
  <path d="M3 14.5A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5h8a.5.5 0 0 1 0 1H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 1 0v5a1.5 1.5 0 0 1-1.5 1.5z"/>
  <path d="m8.354 10.354 7-7a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0"/>
</svg>`;
// https://icons.getbootstrap.com/icons/square/
const html_unchecked_square = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="display: inline bi bi-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
</svg>`;

export function process_cooked(cooked: string) {
	if (cooked === undefined || cooked === null || cooked === '' ) {
		return '';
	}
	cooked = cooked.replaceAll(`<span class="chcklst-box checked fa fa-square-check-o fa-fw">`,html_checked_square+`<span class="chcklst-box checked">`);
	cooked = cooked.replaceAll(`<span class="chcklst-box fa fa-square-o fa-fw">`,html_unchecked_square+`<span class="chcklst-box unchecked">`);
	// console.log(cooked);
	// const dom = htmlparser2.parseDocument(cooked);
	return cooked

	// const preElements = domutils.findAll((elem) => elem.tagName === 'pre', dom.children);
	// preElements.forEach((preElem) => {
	// 	const codeElements = domutils.findAll((elem) => elem.tagName === 'code', [preElem]);
	// 	if (codeElements.length > 0) {
	// 		// let removed = dom_render(preElem, { encodeEntities : 'utf8' });
	// 		// let new_el= hljs.highlightElement(preElem).value;
	// 		// domutils.replaceElement(preElem, new_el);
	// 	}
	// });

	// let html = dom_render(dom, { encodeEntities : 'utf8' });

	// console.log(html);
	// return html;
}

