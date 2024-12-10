import { integer, sqliteTable, sqliteView, text } from 'drizzle-orm/sqlite-core';
import { eq, relations } from 'drizzle-orm';
import { generateRandomString } from '@oslojs/crypto/random';
import * as dotenv from 'dotenv';
dotenv.config();

const random = {
	read(bytes: never) {
		crypto.getRandomValues(bytes);
	}
};

function generateId(length: number) {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
	return generateRandomString(random, alphabet, length);
}

const common_timestamps = {
	created_at: integer('created_at', { mode: 'timestamp' }),
	deleted_at: integer('deleted_at', { mode: 'timestamp' }),
	updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
};

export const users = sqliteTable('users', {
	id: integer('id').primaryKey().notNull(),
	username: text('username', { length: 65535 }).notNull().unique(),
	name: text('name', { length: 65535 }),
	admin: integer('admin', { mode: 'boolean' }).notNull(),
	staged: integer('staged', { mode: 'boolean' }).notNull(),
	active: integer('active', { mode: 'boolean' }).notNull(),
	moderator: integer('moderator', { mode: 'boolean' }).notNull(),
	trust_level: integer('trust_level').notNull(),
	avatar_template: text('avatar_template', { length: 65535 }).notNull(),
	title: text('title', { length: 65535 }),
	groups: text('groups', { length: 65535 }).notNull(),
	locale: text('locale', { length: 65535 }),
	silenced_till: integer('silenced_till', { mode: 'timestamp' }),
	created_at: integer('created_at', { mode: 'timestamp' }),
	updated_at: integer('updated_at', { mode: 'timestamp' })
});

export const discourseUserRelations = relations(users, ({ many }) => ({
	api_keys: many(discourse_api_keys),
	posts: many(posts)
}));

export const discourse_api_keys = sqliteTable('discourse_api_keys', {
	id: integer('id').primaryKey().notNull(),
	// TODO: populate users table from discourse. the user may not exist when insert into this table
	// user_id: integer('user_id').references(() => users.id),
	user_id: integer('user_id'),
	key: text('key').notNull(),
	truncated_key: text('truncated_key'),
	description: text('description'),
	last_used_at: integer('last_used_at', { mode: 'timestamp' }),
	created_at: integer('created_at', { mode: 'timestamp' }),
	updated_at: integer('updated_at', { mode: 'timestamp' }),
	revoked_at: integer('revoked_at', { mode: 'timestamp' }),
	api_key_scopes: text('api_key_scopes', { length: 65535 })
});

export const posts = sqliteTable('posts', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$default(() => generateId(64)),
	raw: text('raw', { length: 65535 }).notNull(),
	cooked: text('cooked', { length: 65535 }).notNull(),
	post_number: integer('post_number').notNull(),
	topic_id: integer('topic_id').notNull(),
	user_id: integer('user_id').references(() => users.id),
	reply_to_post_number: integer('reply_to_post_number'),
	reply_to_user_id: integer('reply_to_user_id'),
	reply_count: integer('reply_count'),
	like_count: integer('like_count'),
	word_count: integer('word_count'),
	deleted: integer('deleted', { mode: 'boolean' }).$default(() => false),
	is_main_post: integer('is_main_post', { mode: 'boolean' }).notNull(),
	main_post_id: text('main_post_id', { length: 64 }).notNull(),
	reply_to_post_id: text('reply_to_post_id', { length: 64 }),
	...common_timestamps
});

export const topics_view = sqliteView('topics_view').as((qb) =>
	qb.select().from(posts).where(eq(posts.is_main_post, true))
);

export type User = typeof users.$inferSelect;

export type DiscourseApiKey = typeof discourse_api_keys.$inferSelect;