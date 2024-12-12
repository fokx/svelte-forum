<script lang="ts">
	import type { PageData } from './$types';
	import { update_user_replies } from '$lib';
	import Topic from '$lib/components/Topic.svelte';
	import { Spinner } from 'svelte-5-ui-lib';

	let { data }: { data: PageData } = $props();

	async function get_or_update_user_replies() {
		// TODO: check latest is updated in Discourse and fetch latest data
		// TODO: infinite scroll
		let replies = await update_user_replies(data.user.username);
		return replies;
	}
</script>

{#await get_or_update_user_replies()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />

{:then replies}
	{#if replies.length > 0}
		<h2>My Replies</h2>
		<ul>
			{#each replies as post}
				<Topic post={post} />
			{/each}
		</ul>
	{:else}
		<p>No replies found</p>
	{/if}
{:catch error}
	<p style="color: red">Error loading my replies: {error.message}</p>
{/await}
