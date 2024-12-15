<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { dbb } from '$lib/dbb';
	import { update_latest_topics } from '$lib';
	import Topic from '$lib/components/Topic.svelte';
	import Post from '$lib/components/Post.svelte';
	import { Spinner } from 'svelte-5-ui-lib';
	import { liveQuery } from 'dexie';

	let { data }: { data: PageData } = $props();

	let latest_topics = liveQuery(() =>
		dbb.posts.orderBy('last_posted_at').filter(p => p.post_number === 1).desc().toArray()
	);
	async function load_or_fetch_latest_topics() {
		// TODO: check latest is updated in Discourse and fetch latest data
		// TODO: infinite scroll
		let topics = await update_latest_topics();
		// let topics = [];
		// if (browser) {
		// 	topics = await dbb.posts.where('post_number').equals(1).limit(50).toArray();
		// 	if (topics.length > 0) {
		// 		return topics;
		// 	} else {
		// 		topics = await update_latest_topics();
		// 	}
		// }
		return topics;
	}
</script>

{#await load_or_fetch_latest_topics()}
	<span>Fetching...</span>
	<Spinner class="me-3" size="4" color="teal" />
{:then topics}
<!--	<span>Update finished</span>-->
	<!--{#if topics.length > 0}-->
	<!--	<ul>-->
	<!--		{#each topics as topic}-->
	<!--			<Topic post={topic} />-->
	<!--		{/each}-->
	<!--	</ul>-->
	<!--{:else}-->
	<!--	<p class="text-gray-900 dark:text-white">No topics found</p>-->
	<!--{/if}-->
{:catch error}
	<p style="color: red">Error loading latest topics: {error.message}</p>
{/await}

{#if $latest_topics && $latest_topics.length > 0}
		<ul>
			{#each $latest_topics as topic}
				<Topic post={topic} />
			{/each}
		</ul>
{:else}
		<p class="text-gray-900 dark:text-white">No topics found</p>
{/if}