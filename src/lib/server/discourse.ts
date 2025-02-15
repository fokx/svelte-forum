import crypto from 'crypto';
import 'dotenv/config';
import { DISCOURSE_COOKIE_KEY, DISCOURSE_GUEST_ACCOUNT_USERINFO_COOKIE } from '$env/static/private';
import { dbs } from '$lib/server/db';
import { discourse_api_keys, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { admin_get_url } from '$lib/server';
import type { DiscourseUser } from '$lib';
import { admin_post_url } from './index';

// import { users,discourse_api_keys} from "$lib/server/db/schema";

export function ReadDiscourseUser(cookie_text: string): DiscourseUser {
	const guestUser = {id :6818,username:"guest",name:null,admin:false,moderator:false,trust_level:3,avatar_template:"/letter_avatar_proxy/v4/letter/g/8dc957/{size}.png",title:null,groups:["INTL","trust_level_0","trust_level_1","trust_level_2","trust_level_3"],locale:null,silenced_till:null,staged:false,active:true,created_at:"2024-12-10T01:10:26.154Z",updated_at:"2024-12-10T01:12:06.822Z",hmac:"437027714535607ff06b3c8e35b11e793355eee87cf3eb49bfca13f308c7f092"};

	try {
		if (cookie_text === undefined || cookie_text === null || cookie_text === '') {
			cookie_text = DISCOURSE_GUEST_ACCOUNT_USERINFO_COOKIE;
		}
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
		} else {
			return guestUser;
		}
	} catch (error) {
		return guestUser;
	}
}

export async function GetDiscourseUserNameInsertIfNotExist(user_id: number) : string {
	const user: DiscourseUser = await admin_get_url(`/admin/users/${user_id}.json`);
	if (user) {
		const userValues = {
			id: user.id,
			username: user.username,
			name: user.name,
			admin: user.admin,
			staged: user.staged,
			active: user.active,
			moderator: user.moderator,
			trustLevel: user.trust_level,
			avatarTemplate: user.avatar_template,
			title: user.title,
			groups: JSON.stringify(user.groups),
			locale: user.locale,
			silencedTill: user.silenced_till,
			createdAt: new Date(user.created_at),
			updatedAt: new Date(user.updated_at)
		};

		await dbs.insert(users).values(userValues).onConflictDoUpdate({
			target: users.id,
			set: userValues
		});
		return user.username;
	} else {
		throw new Error('cannot get username for user ' + user_id);
	}
}

export async function CreateDiscourseUserApiKeyAndReturnKey(user: DiscourseUser) : string {
	const response = await admin_post_url('/admin/api/keys', `{"key":{"description":"user-api-key","username":"${user.username}"}}`);
	if (response) {
		const key = response.key;

		await dbs.insert(discourse_api_keys).values({
			id: key.id,
			user_id: user.id,
			key: key.key,
			truncated_key: key.truncated_key,
			description: key.description,
			last_used_at: key.last_used_at ? new Date(key.last_used_at) : null,
			created_at: new Date(key.created_at),
			updated_at: new Date(key.updated_at),
			revoked_at: key.revoked_at ? new Date(key.revoked_at) : null,
			api_key_scopes: JSON.stringify(key.api_key_scopes)
		});
		return key.key;
	}
}

