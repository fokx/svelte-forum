import Dexie from 'dexie';

export const dbd = new Dexie('svelte-forum');

dbd.version(1).stores({
	posts:
		'&id, raw, cooked, post_number, topic_id, user_id, reply_to_post_number, reply_to_user_id, reply_count, like_count, word_count, deleted, is_main_post, main_post_id, reply_to_post_id, created_at, deleted_at,  updated_at',
	users:
		'&id, username, name, admin, staged, active, moderator, trust_level, avatar_template, title, groups, locale, silenced_till, created_at, updated_at, deleted_at',
	discourse_api_keys:
		'&id, user_id, key, truncated_key, description, last_used_at, created_at, updated_at, revoked_at, api_key_scopes',
	categories:
	'&id, name, color, text_color, slug, topic_count, post_count, position, description, topic_url',
	// description is html
});
