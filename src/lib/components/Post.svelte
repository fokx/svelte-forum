<script lang="ts">
	import { assemble_avatar_full_url, display_time, GeneratePostId, post_url, process_cooked } from '$lib';
	import { Avatar, Card } from 'svelte-5-ui-lib';
	import RichTextComposer from '$lib/components/MyRichTextComposer.svelte';
	import { convertToMarkdownString, PLAYGROUND_TRANSFORMERS } from '../../../../svelte-lexical/packages/svelte-lexical';
	import Reply from 'svelte-bootstrap-svg-icons/Reply.svelte';
	import { dbb } from '$lib/dbb';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Self from './Post.svelte';
	import { fly, slide } from 'svelte/transition';
	import hljs from 'highlight.js';
	let {
		post,
		indent = 0,
		expand = false,
		replies_prop = []
	} = $props();
	let composerComponent = $state();
	let editing = $state(false);
	let autosaveTimer;

	async function get_replies() {
		let replies = [];
		if (browser) {
			replies = await dbb.posts.where({
				reply_to_post_id: post.id
			}).toArray();
		}

		return replies;
	}

	async function reply_post() {
		const editor = composerComponent.getEditor();
		// let state = (JSON.stringify(editor.getEditorState()));
		let markdown;
		editor.update(() => {
			markdown = convertToMarkdownString(
				PLAYGROUND_TRANSFORMERS,
				undefined,
				true
			);
		});
		if (!markdown) {
			alert('Reply is empty!');
			return;
		}
		let post_id = GeneratePostId();
		let body = {
			'raw': markdown,
			'topic_id': post.topic_id,
			'reply_to_post_number': post.post_number,
			'external_id': post_id,
			'reply_to_post_external_id': post.id
		};
		dbb.posts.add({
			id: post_id,
			raw: markdown,
			// the following fields are not present in api response
			reply_to_user_id: null,
			is_main_post: false,
			main_post_id: post.main_post_id,
			reply_to_post_number: post.post_number,
			reply_to_post_id: post.id,
			synced_at: null,
		});
		let response = await post_url('/posts.json', JSON.stringify(body));
		if (response.status === 200) {
			// alert('Post submitted successfully!');
			response = await response.json();
			dbb.posts.update(post_id, {
				cooked: response?.cooked,
				post_number: response?.post_number,
				topic_id: response?.topic_id,
				user_id: response?.user_id,
				reply_count: response?.reply_count,
				created_at: response?.created_at,
				deleted_at: response?.deleted_at,
				updated_at: response?.updated_at,
				synced_at: new Date(),
			});
			if (autosaveTimer) {
				clearInterval(autosaveTimer);
			}
		} else {
			alert('Failed to submit post!');
		}
	}

	onMount(() => {
		autosaveTimer = setInterval(() => {
			if (!composerComponent) {
				return;
			}
			const editor = composerComponent.getEditor();
			let markdown;
			editor.update(() => {
				markdown = convertToMarkdownString(
					PLAYGROUND_TRANSFORMERS,
					undefined,
					true
				);
			});
			dbb.draft_cache.put({ url: window.location.pathname, markdown: markdown });
			// TODO: load draft from cache when composer mounted
		}, 5000);
	});

	async function enable_reply_modal() {
		editing = true;
	}

	async function disable_reply_modal() {
		editing = false;
	}

	// function get_avatar_template(user_id: number){
	// 	// TODO get user info
	// 	return undefined;
	// }
	if (browser) {
		hljs.highlightAll();
			// document.querySelectorAll('pre code').forEach((el) => {
			// 	hljs.highlightElement(el);
			// });
	}

</script>

{#snippet post_data(post)}
	<div class="flex-grow justify-center primary-links dotted-ul prose dark:prose-invert">
		<Card class="max-w-3xl" >
			{#if post.title}
				<div class="flex justify-center">
					<h5 class="mb-2 text-2xl font-bold tracking-tight">{post.title}</h5>
				</div>
			{/if}
			<div class="flex justify-between items-center mb-2">
				<Avatar size="md" class="rotate-360 me-1 ms-3" src={assemble_avatar_full_url(post.avatar_template)} />
				<h6 class="mt-4 text-md font-bold tracking-tight">
					{#if (post.updated_at - post.created_at) > 5 * 60 * 1000}
						<div>updated at: {display_time(post.updated_at)}</div>
					{:else}
						<div>created at: {display_time(post.created_at)}</div>
					{/if}
				</h6>
			</div>
			{@html process_cooked(post.cooked)}
			<div class="flex justify-end items-center">
				<a class="text-blue-800 dark:text-blue-500 text-xl mr-2" href={`/p/${post.id}`}># {post.post_number}</a>
				<button
					class="block"
					onclick={() => enable_reply_modal()}
					title={`Reply to post #${post.post_number}`}
					aria-label={`Reply to post #${post.post_number}`}>
					<Reply />
				</button>
			</div>
		</Card>
	</div>
	{#if editing}
		<div class="">
			<RichTextComposer bind:this={composerComponent} />
			<div class="actionbar">
				<button
					class="action-button submit"
					onclick={() =>reply_post()}
					title="Submit"
					aria-label="Submit editor state">
					<Reply />
				</button>
				<!-- We need the user to confirm before closing the reply modal-->
				<!--				<button-->
				<!--					class="action-button close"-->
				<!--					onclick={() =>disable_reply_modal()}-->
				<!--					title="Close"-->
				<!--					aria-label="Close this composer">-->
				<!--					<XLg />-->
				<!--				</button>-->
			</div>
		</div>
	{/if}
{/snippet}

{#if post}
	<div in:fly={{ y: 20 }} out:slide class="items-center relative" style="margin-left: { indent * 20}px;">
		{#each Array(indent + 1) as _, j}
			<div class="absolute top-0 bottom-0 left-0 w-px bg-black opacity-20" style="left: {(j-indent) * 20 - 0}px;"></div>
		{/each}
		<div style="display:inline;">
			{@render post_data(post)}
		</div>
	</div>

	{#if expand}
		{#await get_replies()}
			<div>Loading replies...</div>
		{:then replies}
			{#each replies as reply}
				<Self post={reply} expand={expand} indent={indent + 1}/>
			{/each}
		{:catch error}
			<div style="color: red">{error.message}</div>
		{/await}
	{/if}
{/if}
