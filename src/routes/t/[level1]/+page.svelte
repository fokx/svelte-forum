<script lang="ts">
	// /t/{topic_id} route

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Post from '$lib/components/Post.svelte';
	import { update_local_topic } from '$lib';
	import { Spinner } from 'svelte-5-ui-lib';
	import '../../../app.css';

	let { data }: { data: PageData } = $props();
	let threaded_view = $state(true);

	async function load_or_fetch_topic_posts() {
		// TODO: check topic is updated in Discourse and fetch latest data
		let posts = await update_local_topic(Number(data.params.level1));
		console.log('posts', posts);
		// let posts = [];
		// if (browser) {
		// 	posts = await dbb.posts.where('topic_id').equals(Number(data.params.level1)).toArray();
		// 	if (posts.length > 0) {
		// 		return posts;
		// 	} else {
		// 		posts = await update_local_topic(Number(data.params.level1));
		// 	}
		// }
		return posts;
	}

	onMount(() => {
	});
</script>


{#await load_or_fetch_topic_posts()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />
{:then posts}
	{#if threaded_view}
		<Post post={posts[0]} expand={true} inside_topic={true}/>
	{:else}
		{#each posts as post}
			{#if post}
				<Post post={post}/>
			{:else}
				<p>Post not found</p>
			{/if}
		{/each}
	{/if}
{:catch error}
	<p style="color: red">Topic cannot be loaded with {error.message}</p>
{/await}



