### Forum App under dev


```
header Access-Control-Allow-Headers *
header Access-Control-Allow-Origin http://localhost:5173                              
# header Access-Control-Allow-Origin https://east.xjtu.app                             
# header Access-Control-Allow-Origin *                                                 
# header Access-Control-Allow-Origin http://127.0.0.1:5173                             
```

```zsh
#!/bin/zsh
host=mnz
rsync -av --delete /f/svelte-forum $host:/srv/ --exclude={"*.db",".env","node_modules/*","build/*",".svelte-kit/*"}
ssh $host chown -R forum:forum /srv/svelte-forum

pnpm dev --port 4002
cd /srv/svelte-forum; pnpm i && pnpm run build && pnpm db:push && lsof -i :4002|tail -1|awk "{print $2}"|xargs kill; HOST=127.0.0.1 PORT=4002 node build

```

```aiignore
sv restart unicorn
rails c
UserAuthToken.destroy_all
ApiKey.where(description: "user-api-key").destroy_all
```
