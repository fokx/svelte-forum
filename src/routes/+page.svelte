<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import { dbb } from '$lib/dbb';
	import { update_latest_topics } from '$lib';
	import Topic from '$lib/components/topic.svelte';
	import Post from '$lib/components/post.svelte';
	let { data }: { data: PageData } = $props();

	async function load_or_fetch_latest_topics() {
		// TODO: check latest is updated in Discourse and fetch latest data
		// TODO: infinite scroll
		let topics = [];
		if (browser) {
			topics = await dbb.posts.where('post_number').equals(1).limit(50).toArray();
			if (topics.length > 0) {
				return topics;
			} else {
				topics = await update_latest_topics();
			}
		}
		return topics;
	}
</script>

{#await load_or_fetch_latest_topics()}
	<p>Loading...</p>
{:then topics}
	{#if topics.length > 0}
		<h2>Latest Topics</h2>
		<ul>
			{#each topics as topic}
				<Topic post={topic} />
			{/each}
		</ul>
	{:else}
		<p>No topics found</p>
	{/if}
{:catch error}
	<p style="color: red">Error loading latest topics: {error.message}</p>
{/await}
