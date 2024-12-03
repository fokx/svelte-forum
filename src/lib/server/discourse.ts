import crypto from 'crypto';
import 'dotenv/config';
import { DISCOURSE_ADMIN_API_KEY_USERNAME, DISCOURSE_COOKIE_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { discourseApiKeys, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { admin_get_url, post_url } from '$lib'; // import { users,discourseApiKeys} from "$lib/server/db/schema";

// import { users,discourseApiKeys} from "$lib/server/db/schema";
export interface DiscourseUserFromCookie {
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

export function ReadDiscourseUser(cookie_text: string): DiscourseUserFromCookie | undefined {
	try {
		const uriDecodedPayload = decodeURIComponent(cookie_text);
		const base64DecodedBuffer = Buffer.from(uriDecodedPayload, 'base64');
		const jsonPayload = JSON.parse(base64DecodedBuffer.toString());

		const jsonPayload_hmac = jsonPayload['hmac'];
		delete jsonPayload['hmac'];
		const payloadSha = crypto
			.createHash('sha256')
			.update(JSON.stringify(jsonPayload))
			.digest('hex');
		const signed = crypto
			.createHmac('sha256', DISCOURSE_COOKIE_KEY)
			.update(payloadSha)
			.digest('hex');

		if (signed === jsonPayload_hmac) {
			return jsonPayload;
		}
		return undefined;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}

export async function GetDiscourseUserNameInsertIfNotExist(user_id: number) {
	console.log(user_id);
	console.log(DISCOURSE_ADMIN_API_KEY_USERNAME);
	const response: DiscourseUserFromCookie = await admin_get_url(
		'/admin/users/' + user_id + '.json'
	);
	if (response) {
		const userValues = {
			id: response.id,
			username: response.username,
			passwordHash: '', // You need to handle password hash appropriately
			name: response.name,
			admin: response.admin,
			staged: response.staged,
			active: response.active,
			moderator: response.moderator,
			trustLevel: response.trust_level,
			avatarTemplate: response.avatar_template,
			title: response.title,
			groups: JSON.stringify(response.groups),
			locale: response.locale,
			silencedTill: response.silenced_till,
			createdAt: new Date(response.created_at),
			updatedAt: new Date(response.updated_at)
		};

		await db.insert(users).values(userValues).onConflictDoUpdate({
			target: users.id,
			set: userValues
		});
		return response.username;
	} else {
		console.log(response);
		throw new Error('cannot get username for user ' + user_id);
	}
}

export async function CreateDiscourseUserApiKey(user_id: number) {
	const username = await GetDiscourseUserNameInsertIfNotExist(user_id);
	const response = post_url('/admin/api/keys', username);
	if (response) {
		const key = response.key;

		await db.insert(discourseApiKeys).values({
			id: key.id,
			userId: user_id,
			key: key.key,
			truncatedKey: key.truncated_key,
			description: key.description,
			lastUsedAt: key.last_used_at ? new Date(key.last_used_at) : null,
			createdAt: new Date(key.created_at),
			updatedAt: new Date(key.updated_at),
			revokedAt: key.revoked_at ? new Date(key.revoked_at) : null,
			apiKeyScopes: JSON.stringify(key.api_key_scopes)
		});
		return key.key;
	}
}

export async function GetUserApiKeyCreateIfNotExists(user_id: number) {
	const result = await db
		.select()
		.from(discourseApiKeys)
		.where(eq(discourseApiKeys.userId, user_id))
		.limit(1);
	if (result.length) {
		return result[0].key;
	} else {
		return await CreateDiscourseUserApiKey(user_id);
	}
}
