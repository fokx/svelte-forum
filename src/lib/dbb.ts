import Dexie from 'dexie';
// Dexie.debug = 'dexie';

export const dbb = new Dexie('svelte-forum');

/*
NOTE: Unlike SQL, you don’t need to specify all properties but only the one you wish to index.
Schema Syntax
++	Auto-incremented primary key
&	Unique index
*	Multi-entry index
[A+B]	Compound index or primary key
https://dexie.org/docs/Version/Version.stores()
https://dexie.org/docs/MultiEntry-Index
https://dexie.org/docs/Compound-Index
https://dexie.org/docs/inbound
https://dexie.org/docs/Table/Table.where()
https://dexie.org/docs/Table/Table.filter()
https://dexie.org/docs/Tutorial/Understanding-the-basics#primary-and-secondary-indexes
https://dexie.org/cloud/docs/best-practices#examples-primary-keys
 */
dbb.version(4).stores({
	posts: '&id, main_post_id, topic_id, post_number, reply_to_post_number, last_posted_at, reply_to_post_id, synced_at', //[topic_id+post_number],[topic_id+reply_to_post_number],
	users: '&id, username',
	discourse_api_keys: '&id, user_id',
	categories: '&id, name, slug',
	draft_cache: '&url',
	cache: '++, api_username, api_key',
	msgs: '&id, sender, receiver, msg, created_at, type',
	rgv: '&name', // reactive global variables
});
