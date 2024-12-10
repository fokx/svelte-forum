<script lang="ts">
	// /t/{topic_id} route

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { dbd } from '$lib/dbd';

	let { data }: { data: PageData } = $props();
	let get_post = dbd.posts.get({topic_id: 13992});
	// let get_post = dbd.posts.get({topic_id: Number(data.params.level1)});
	// let get_post = dbd.posts.get(44378);
	onMount(() => {
	});
</script>
{#await get_post}
	Loading...
{:then post}
	{#if post}
		<h3>Post</h3>
		{post.cooked}
	{:else}
		<p>Post not found</p>
	{/if}
{:catch error}
	<p style="color: red">Post not found with {error.message}</p>
{/await}
