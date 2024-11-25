import { integer, sqliteTable, sqliteView, text } from 'drizzle-orm/sqlite-core';
import { eq, relations } from 'drizzle-orm';
import { generateRandomString } from '@oslojs/crypto/random';

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
	createdAt: integer('created_at', { mode: 'timestamp' }),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
};

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const users = sqliteTable('users', {
	id: integer('id').primaryKey().notNull(),
	username: text('username', { length: 65535 }).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name', { length: 65535 }),
	admin: integer('admin', { mode: 'boolean' }).notNull(),
	staged: integer('staged', { mode: 'boolean' }).notNull(),
	active: integer('active', { mode: 'boolean' }).notNull(),
	moderator: integer('moderator', { mode: 'boolean' }).notNull(),
	trustLevel: integer('trust_level').notNull(),
	avatarTemplate: text('avatar_template', { length: 65535 }).notNull(),
	title: text('title', { length: 65535 }),
	groups: text('groups', { length: 65535 }).notNull(),
	// "groups":["trust_level_0","trust_level_2","admins","trust_level_3","trust_level_4","staff","trust_level_1","INTL"],
	locale: text('locale', { length: 65535 }),
	silencedTill: integer('silenced_till', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
});

export const discourseUserRelations = relations(users, ({ many }) => ({
	apiKeys: many(discourseApiKeys),
	posts: many(posts)
}));

export const discourseApiKeys = sqliteTable('discourse_api_keys', {
	id: integer('id').primaryKey().notNull(),
	userId: integer('user_id').references(() => users.id),
	key: text('key').notNull(),
	truncatedKey: text('truncated_key'),
	description: text('description'),
	lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' }),
	revokedAt: integer('revoked_at', { mode: 'timestamp' }),
	// "api_key_scopes": []
	apiKeyScopes: text('api_key_scopes', { length: 65535 })
});

export const posts = sqliteTable('posts', {
	id: text('id')
		.primaryKey()
		.notNull()
		.$default(() => generateId(64)),
	raw: text('raw', { length: 65535 }).notNull(),
	cooked: text('cooked', { length: 65535 }).notNull(),
	postNumber: integer('post_number').notNull(),
	topicId: integer('topic_id').notNull(),
	userId: integer('user_id').references(() => users.id),
	replyToPostNumber: integer('reply_to_post_number'),
	replyToUserId: integer('reply_to_user_id'),
	replyCount: integer('reply_count'),
	likeCount: integer('like_count'),
	wordCount: integer('word_count'),
	deleted: integer('deleted', { mode: 'boolean' }).$default(() => false),
	isMainPost: integer('is_main_post', { mode: 'boolean' }).notNull(),
	mainPostId: text('main_post_id', { length: 64 }).notNull(),
	replyToPostId: text('reply_to_post_id', { length: 64 }),
	...common_timestamps
});

export const topicsView = sqliteView('topics_view').as((qb) =>
	qb.select().from(posts).where(eq(posts.isMainPost, true))
);

export type Session = typeof sessions.$inferSelect;

export type User = typeof users.$inferSelect;

export type DiscourseUser = typeof users.$inferSelect;

export type DiscourseApiKey = typeof discourseApiKeys.$inferSelect;
