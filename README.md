## Forum App under dev


```
header Access-Control-Allow-Headers *
header Access-Control-Allow-Origin http://127.0.0.1:5173                             
# header Access-Control-Allow-Origin * 
```

```zsh
#!/bin/zsh
host=mnz
rsync -av --delete /f/svelte-forum $host:/srv/ --exclude={"*.db",".env","node_modules/*","build/*",".svelte-kit/*"}
ssh $host chown -R discourse:discourse /srv/svelte-forum
pnpm dev --port 4002
cd /srv/svelte-forum; pnpm i && pnpm run build && pnpm db:push && lsof -i :4002|tail -1|awk "{print $2}"|xargs kill; sleep 1; HOST=127.0.0.1 PORT=4002 node build

rsync -av --delete /f/svelte-5-ui-lib $host:/srv/ --exclude={"*.db",".env","node_modules/*","build/*",".svelte-kit/*"}
ssh $host chown -R discourse:discourse /srv/svelte-5-ui-lib
cd /srv/svelte-5-ui-lib; pnpm i && pnpm build && pnpm package


rsync -av --delete /f/svelte-lexical $host:/srv/ --exclude={"*.db",".env","node_modules/*","build/*",".svelte-kit/*"}
ssh $host chown -R discourse:discourse /srv/svelte-lexical
cd /srv/svelte-lexical; pnpm i; cd packages/svelte-lexical; pnpm build



```

```
sv restart unicorn
rails c
UserAuthToken.destroy_all
ApiKey.where(description: "user-api-key").destroy_all
```

server side sqlite exported as `dbs`
```js
import { dbs } from '$lib/server/db';
```

browser side IndexDB exported as `dbb`, e.g.:
```js
import { dbb } from '$lib/dbb';
import { browser } from '$app/environment';
let topic_posts = $state([]);
if (browser){
	topic_posts= dbb.posts.where("topic_id").equals(Number(data.params.level2)).toArray();
}
```

Discourse API docs:
https://docs.discourse.org/

### offline-first
[ ] when user presses submit button, the post is tagged with random string as global ID, marked as not-synced 
and then sent together with the global ID,
when the server returns OK, it is marked as synced.
When composing using Discourse, a global ID is generated by the server so that all post has a global ID.
Use rake to populate IDs for existing Discourse posts.

TODO: do we need to allow global_id when handling incoming post in discourse
check:
https://github.com/angusmcleod/discourse-events/commit/33ba86f66e22afaab30dd64eb0e51e45f17860c9#diff-040b0c3e0e3b0c377ccb9da72d51e1a9716135b8958e74aa81f104651972ee23R90
https://docs.discourse.org/#tag/Topics/operation/createTopicPostPM
https://meta.discourse.org/t/are-custom-fields-on-posts-topics-available-via-the-api/49455/8

[ ] Draft is saved in browser IndexedDB periodically 
so that the *latest* draft can be recovered from browser crash or when user navigates to other page

[x] categories cached in browser, manual refresh in user settings


## Bugs
[ ] When dark mode is toggled manually, it will cease after a full refresh. 
[ ] RichTextComposer doesn't have dark mode