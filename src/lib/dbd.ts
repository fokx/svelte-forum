import Dexie from 'dexie';
// Dexie.debug = 'dexie';

export const dbd = new Dexie('svelte-forum');

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
dbd.version(1).stores({
	posts: '&id, [topic_id+post_number]',
	users: '&id, username',
	discourse_api_keys: '&id, user_id',
	categories: '&id, name, slug',
	draft_cache: '&url',
	cache: '++, api_username, api_key'
});
