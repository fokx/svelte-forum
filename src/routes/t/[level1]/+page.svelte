<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { PageData } from './$types';
	import Post from '$lib/components/Post.svelte';
	import { update_local_topic_by_external_id } from '$lib';
	import { Spinner } from 'svelte-5-ui-lib';
	import '../../../app.css';
	import { liveQuery } from 'dexie';
	import { dbb } from '$lib/dbb';
	import { browser } from '$app/environment';
	// onMount(async () => {
	// 	let flatViewChecked = localStorage.getItem('FLAT_VIEW') === 'true';
	// 	if (browser) {
	// 		dbb.rgv.put({ name: 'preference_flat_view', value: flatViewChecked.toString() });
	// 	}
	// });
	let { data }: { data: PageData } = $props();

	let topic_posts = liveQuery(() =>
		dbb.posts.filter(p => p.main_post_id === data.params.level1).toArray()
			.then(a => a.sort((a, b) => a.post_number < b.post_number ? -1 : 1))
	);

	async function load_or_fetch_topic_posts() {
		let posts = await update_local_topic_by_external_id(data.params.level1);
		return posts;
	}
	import { siteTitle } from '$lib/stores';
	$effect(() => {
		if (browser && $topic_posts && $topic_posts.length > 0) {
			let title = $topic_posts[0].title;
			siteTitle.set(title);
		}
	});
	let grv_preference_flat_view = liveQuery(() =>
		dbb.rgv.get('preference_flat_view')
	);
</script>

{#await load_or_fetch_topic_posts()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />
{:then posts}
	{#if !posts}
		<p style="color: red">Topic not found</p>
	{/if}
{:catch error}
	<p style="color: red">Topic cannot be loaded with {error.message}</p>
{/await}

{#if $topic_posts && $topic_posts.length > 0}
	{#if $grv_preference_flat_view?.value !== 'true'}
		<Post post={$topic_posts[0]} expand={true} />
	{:else}
		{#each $topic_posts as post}
			{#if post}
				<Post post={post} />
			{:else}
				<p>Post not found</p>
			{/if}
		{/each}
	{/if}
{/if}
