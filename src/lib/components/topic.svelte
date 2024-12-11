<script lang="ts">
	import { assemble_avatar_full_url, get_avatar_url_by_username, display_time, GeneratePostId, post_url } from '$lib';
	import { Avatar, Card } from 'svelte-5-ui-lib';
	import Reply from 'svelte-bootstrap-svg-icons/Reply.svelte';
	import { dbb } from '$lib/dbb';
	import { onMount } from 'svelte';
	let {
		post = $bindable(),
	} = $props();

	onMount(() => {
	});

</script>

{#snippet post_data(post)}
	<div class="flex-grow justify-center">
		<Card class="max-w-3xl mb-2">
			{#if post.title}
				<div class="flex justify-center">
					<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{post.title}</h5>
				</div>
			{/if}
				<div class="flex justify-between items-center mb-2">
					{#await get_avatar_url_by_username(post.last_poster_username)}
						<Avatar size="md" class="rotate-360 me-1 ms-3" src={assemble_avatar_full_url('')} />
					{:then a_t}
						<Avatar size="md" class="rotate-360 me-1 ms-3" src={assemble_avatar_full_url(a_t)} />
					{:catch error}
						<Avatar size="md" class="rotate-360 me-1 ms-3" src={assemble_avatar_full_url('')} />
					{/await}
					<h6 class="mt-4 text-md font-bold tracking-tight text-gray-900 dark:text-white">
						last updated: {display_time(post.last_posted_at)}
					</h6>
				</div>
			{@html post.cooked}
		</Card>
	</div>
{/snippet}


<!--{#if indent === 0}-->
<!--	<div class="original-post">-->
<!--		<div style="display: block; padding: 6px;">-->
<!--			<User data={data} user_id={post.user_id} />-->
<!--</div>-->
{@render post_data(post)}
<!--</div>-->
<!--{/if}-->
