import { integer, sqliteTable, sqliteView, text } from 'drizzle-orm/sqlite-core';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();


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

function GeneratePostId() {
	return generateRandomString(16);
}

const common_timestamps = {
	created_at: integer('created_at', { mode: 'timestamp' }),
	deleted_at: integer('deleted_at', { mode: 'timestamp' }),
	updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
};

export const users = sqliteTable('users', {
	id: text('id').primaryKey().notNull(),
	username: text('username',).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name'),
	admin: integer('admin', { mode: 'boolean' }),
	staged: integer('staged', { mode: 'boolean' }),
	active: integer('active', { mode: 'boolean' }),
	moderator: integer('moderator', { mode: 'boolean' }),
	trust_level: integer('trust_level'),
	avatar_template: text('avatar_template'),
	title: text('title'),
	groups: text('groups'),
	locale: text('locale'),
	silenced_till: integer('silenced_till', { mode: 'timestamp' }),
	created_at: integer('created_at', { mode: 'timestamp' }),
	updated_at: integer('updated_at', { mode: 'timestamp' })
});


export const posts = sqliteTable('posts', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$default(() => GeneratePostId()),
	raw: text('raw').notNull(),
	cooked: text('cooked').notNull(),
	post_number: integer('post_number').notNull(),
	topic_id: integer('topic_id').notNull(),
	user_id: integer('user_id').references(() => users.id),
	username: text('username').notNull(),
	reply_to_post_number: integer('reply_to_post_number'),
	reply_to_user_id: integer('reply_to_user_id'),
	reply_count: integer('reply_count'),
	like_count: integer('like_count'),
	word_count: integer('word_count'),
	deleted: integer('deleted', { mode: 'boolean' }).$default(() => false),
	is_main_post: integer('is_main_post', { mode: 'boolean' }).notNull(),
	main_post_id: text('main_post_id').notNull(),
	reply_to_post_id: text('reply_to_post_id'),
	...common_timestamps
});

export const sessions = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof sessions.$inferSelect;

export const topics_view = sqliteView('topics_view').as((qb) =>
	qb.select().from(posts).where(eq(posts.is_main_post, true))
);

export type User = typeof users.$inferSelect;

