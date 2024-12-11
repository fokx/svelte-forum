<script lang="ts">
	// /t/{topic_id} route

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { dbd } from '$lib/dbd';
	import { browser } from '$app/environment';
	import Post from '$lib/components/post.svelte';
	import { update_local_topic } from '$lib';

	let { data }: { data: PageData } = $props();

	async function topic_posts() {
		let posts = [];
		if (browser) {
			posts = await dbd.posts.where('topic_id').equals(Number(data.params.level1)).toArray();
			if (posts.length > 0) {
				return posts;
			} else {
				update_local_topic(data.user.username, data.api_key, Number(data.params.level1));
				return await dbd.posts.where('topic_id').equals(Number(data.params.level1)).toArray();
			}
		}
		return posts;
	}

	onMount(() => {
	});
</script>


{#await topic_posts()}
	Loading...
{:then posts}
	{$inspect(posts)}
	{#each posts as post}
		{#if post}
			<Post post={post} indent={0} />
		{:else}
			<p>Post not found</p>
		{/if}
	{/each}
{:catch error}
	<p style="color: red">Topic not found with {error.message}</p>
{/await}



