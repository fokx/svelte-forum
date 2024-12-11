<script lang="ts">
	// this is /t/{slug}/{topic_id} route, same as Discourse

	import type { PageData } from './$types';
	import { dbd } from '$lib/dbd';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();
	let topic_posts = $state([]);
	if (browser){
		topic_posts= dbd.posts.where("topic_id").equals(Number(data.params.level2)).toArray();
	}
</script>

{#await topic_posts}
	Loading...
{:then posts}
	{$inspect(posts)}
	{#each posts as post}
		{#if post}
			<h2>{post.title}</h2>
			{@html post.cooked}
		{:else}
			<p>Post not found</p>
		{/if}
	{/each}
{:catch error}
	<p style="color: red">Post not found with {error.message}</p>
{/await}



