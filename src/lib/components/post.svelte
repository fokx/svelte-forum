<script lang="ts">
	import { assemble_avatar_full_url, display_time, GeneratePostId, post_url } from '$lib';
	import { Avatar, Card } from 'svelte-5-ui-lib';
	import RichTextComposer from '$lib/components/MyRichTextComposer.svelte';
	import {
		convertToMarkdownString,
		getEditor,
		type LexicalEditor,
		PLAYGROUND_TRANSFORMERS
	} from '../../../../svelte-lexical/packages/svelte-lexical';
	import Reply from 'svelte-bootstrap-svg-icons/Reply.svelte';
	import { dbb } from '$lib/dbb';
	import { onMount } from 'svelte';

	let {
		post = $bindable(),
		indent = $bindable()
	} = $props();
	let composerComponent = $state();
	const editor: LexicalEditor = getEditor();
	let editing = $state(false);
	let autosaveTimer;

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
		console.log('post.main_post_id', post.main_post_id);
		if (!markdown) {
			alert('Reply is empty!');
			return;
		}
		let body = {
			'raw': markdown,
			'topic_id': post.topic_id,
			'reply_to_post_number': post.post_number
		};
		let post_id = GeneratePostId();
		dbb.posts.add({
			id: post_id,
			raw: markdown,
			reply_to_post_id: post.id,
			// the following fields are not present in api response
			reply_to_user_id: null,
			is_main_post: false,
			main_post_id: post.main_post_id
		});
		let response = await post_url('/posts.json', JSON.stringify(body));
		if (response.status === 200) {
			alert('Post submitted successfully!');
			response = await response.json();
			console.log(response);
			dbb.posts.update(post_id, {
				cooked: response?.cooked,
				post_number: response?.post_number,
				topic_id: response?.topic_id,
				user_id: response?.user_id,
				reply_to_post_number: response?.reply_to_post_number,
				reply_count: response?.reply_count,
				created_at: response?.created_at,
				deleted_at: response?.deleted_at,
				updated_at: response?.updated_at
			});
			if (autosaveTimer) {
				console.log(autosaveTimer);
				clearInterval(autosaveTimer);
			}
			alert('Reply successfully!');
		} else {
			alert('Failed to submit post!');
			console.log(response);
		}
	}

	onMount(() => {
		autosaveTimer = setInterval(() => {
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
				<Avatar size="md" class="rotate-360 me-1 ms-3" src={assemble_avatar_full_url(post.avatar_template)} />
				<h6 class="mt-4 text-md font-bold tracking-tight text-gray-900 dark:text-white">
					{#if (post.updated_at - post.created_at) > 5 * 60 * 1000}
						<div>updated at: {display_time(post.updated_at)}</div>
					{:else}
						<div>created at: {display_time(post.created_at)}</div>
					{/if}
				</h6>
			</div>
			{@html post.cooked}
			<button
				class="ml-auto block"
				onclick={() =>enable_reply_modal()}
				title="Reply"
				aria-label="Reply to post">
				<Reply />
			</button>
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


<!--{#if indent === 0}-->
<!--	<div class="original-post">-->
<!--		<div style="display: block; padding: 6px;">-->
<!--			<User data={data} user_id={post.user_id} />-->
<!--</div>-->
{@render post_data(post)}
<!--</div>-->
<!--{/if}-->
