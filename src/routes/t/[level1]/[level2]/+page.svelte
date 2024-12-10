<script lang="ts">
	// this is /t/{slug}/{topic_id} route, same as Discourse

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { dbd } from '$lib/dbd';

	let { data }: { data: PageData } = $props();
	// let get_post = dbd.posts.get({topic_id: Number(data.params.level2)});
	// let get_post = dbd.posts.get(44378);
	// let get_post = dbd.posts.where('topic_id').equals((data.params.level2)).first();
	let get_posts = $state();
	onMount(() => {
		get_posts = dbd.posts.filter(t => t.topic_id === (data.params.level2));
	});
</script>

	{#await get_posts}
		Loading...
	{:then posts}
		{#each posts as post}
			{#if post}
				<h3>{post.title}</h3>
				{post.cooked}
			{:else}
				<p>Post not found</p>
			{/if}
		{/each}
	{:catch error}
		<p style="color: red">Post not found with {error.message}</p>
	{/await}

