<script lang="ts">
	import {
		assemble_avatar_full_url,
		display_time,
		get_avatar_url_by_username,
		get_cached_avatar_url_by_user_id,
		process_cooked
	} from '$lib';
	import { Avatar, Card } from 'svelte-5-ui-lib';
	import { onMount } from 'svelte';

	let {
		post = $bindable()
	} = $props();

	onMount(() => {
	});

</script>

{#snippet avatar(a_t)}
	<Avatar size="md" class="rotate-360 me-1 ms-3" src={assemble_avatar_full_url(a_t)} />
{/snippet}
{#snippet avatar_op(a_t)}
	<Avatar size="md" class="rotate-360 me-10 ms-1" src={assemble_avatar_full_url(a_t)} />
{/snippet}

{#snippet post_data(post)}
	<div class="flex-grow justify-center dotted-ul prose dark:prose-invert">
		<Card class="max-w-3xl mb-2" href={`/t/${post.topic_id}`}>
			{#if post.title}
				<div class="flex justify-center">
					{#if post.original_poster_user_id}
						{#await get_cached_avatar_url_by_user_id(post.original_poster_user_id)}
							{@render avatar_op('')}
						{:then a_t}
							{@render avatar_op(a_t)}
						{/await}
					{/if}
					<h5 class="me-6 mb-2 text-2xl font-bold tracking-tight">{post.title}</h5>
				</div>
			{/if}
			<div class="flex justify-between items-center mb-2">

				<h6 class="me-4 mt-4 text-md font-bold tracking-tight">
					last posted: {display_time(post.last_posted_at)}
				</h6>

				{#await get_avatar_url_by_username(post.last_poster_username||post.acting_username)}
					{@render avatar('')}
				{:then a_t}
					{@render avatar(a_t)}
				{/await}

			</div>
			<div class="primary-links">
				{@html process_cooked(post.excerpt)}
			</div>
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
