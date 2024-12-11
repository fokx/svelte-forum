<script lang="ts">
	// /t/{topic_id} route

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { dbb } from '$lib/dbb';
	import { browser } from '$app/environment';
	import Post from '$lib/components/post.svelte';
	import { update_local_topic } from '$lib';

	let { data }: { data: PageData } = $props();

	async function load_or_fetch_topic_posts() {
		// TODO: check topic is updated in Discourse and fetch latest data
		let posts = [];
		if (browser) {
			posts = await dbb.posts.where('topic_id').equals(Number(data.params.level1)).toArray();
			if (posts.length > 0) {
				return posts;
			} else {
				posts = await update_local_topic(Number(data.params.level1));
			}
		}
		return posts;
	}

	onMount(() => {
	});
</script>


{#await load_or_fetch_topic_posts()}
	Loading...
{:then posts}
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



