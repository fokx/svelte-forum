<script lang="ts">
	import type { PageData } from './$types';
	import { update_user_topics } from '$lib';
	import Topic from '$lib/components/Topic.svelte';
	import { Spinner } from 'svelte-5-ui-lib';

	let { data }: { data: PageData } = $props();

	async function get_or_update_user_topics() {
		// TODO: check latest is updated in Discourse and fetch latest data
		// TODO: infinite scroll
		let topics = await update_user_topics(data.user.username);
		return topics;
	}
</script>

{#await get_or_update_user_topics()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />

{:then topics}
	{#if topics.length > 0}
		<ul>
			{#each topics as topic}
				<Topic post={topic} />
			{/each}
		</ul>
	{:else}
		<p>No topics found</p>
	{/if}
{:catch error}
	<p style="color: red">Error loading user topics: {error.message}</p>
{/await}
