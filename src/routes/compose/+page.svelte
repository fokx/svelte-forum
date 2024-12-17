<script lang="ts">
	import { onMount } from 'svelte';
	import { ImagePlaceholder, Label, Select, Skeleton, Textarea } from 'svelte-5-ui-lib';
	import { convertToMarkdownString, PLAYGROUND_TRANSFORMERS } from 'svelte-lexical';
	import RichTextComposer from '$lib/components/MyRichTextComposer.svelte';
	// import {RichTextComposer} from 'svelte-lexical';
	import type { PageData } from './$types';
	import '../../app.css';
	import Send from 'svelte-bootstrap-svg-icons/Send.svelte';
	import { GeneratePostId, post_url, update_local_categories } from '$lib';
	import { goto } from '$app/navigation';
	import { PUBLIC_MAX_TITLE_LENGTH } from '$env/static/public';
	import { dbb } from '$lib/dbb';

	let { data }: { data: PageData } = $props();
	let title = $state('');
	// 3: admin only
	// 4: general
	const DEFAULT_CATEGORY_ID = 4;
	let category = $state(DEFAULT_CATEGORY_ID);

	async function get_local_categories_fetch_if_not_exists() {
		let categories = await dbb.categories.toArray();
		if (categories.length > 0) {
			return categories;
		} else {
			update_local_categories();
			return await dbb.categories.toArray();
		}
	}

	let autosaveTimer;
	let composerComponent;

	async function submit_post() {
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
		if (!title || !markdown) {
			alert('Title or content is empty!');
			return;
		}
		let post_id = GeneratePostId();
		let body = {
			'title': title,
			'raw': markdown,
			'category': category,
			'external_id': post_id
		};
		dbb.posts.add({
			id: post_id,
			raw: markdown,
			title: title,
			// the following fields are not present in api response
			// like_count: response?.like_count,
			// word_count: response?.word_count,
			// deleted: response?.deleted,
			reply_to_user_id: null,
			is_main_post: true,
			main_post_id: post_id,
			reply_to_post_number: null,
			reply_to_post_id: null,
			synced_at: null
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
				synced_at: new Date()
			});
			if (autosaveTimer) {
				clearInterval(autosaveTimer);
			}
			goto(`/t/${post_id}`);
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
			dbb.draft_cache.put({ url: window.location.pathname, markdown: markdown, title: title });
			// TODO: load draft from cache when composer mounted
		}, 5000);
	});

</script>
<div>
	<form class="flex items-center space-x-4">
		<div class="flex-1">
		<Textarea bind:value={title} id="title" class="bg-white dark:bg-gray-800 w-full" rows={1}
							placeholder="Title (max {PUBLIC_MAX_TITLE_LENGTH})..." maxlength={PUBLIC_MAX_TITLE_LENGTH} />
		</div>
		<div class="w-24">
			<Label for="categories" class="mt-2">category:</Label>
			<Select id="categories" class="mt-2" bind:value={category} placeholder="">
				{#await get_local_categories_fetch_if_not_exists()}
					<option value={DEFAULT_CATEGORY_ID}>Default</option>
				{:then categories}
					{#each categories as cat}
						<option selected={cat.id===DEFAULT_CATEGORY_ID} value={cat.id}
										style="color:#{cat.color}">{cat.name}</option>
					{/each}
				{:catch error}
					<p style="color: red">can not fetch category info: {error.message}</p>
				{/await}
			</Select>
		</div>
	</form>

	<RichTextComposer bind:this={composerComponent} />
	<div class="actionbar">
		<button
			class="action-button submit"
			onclick={() =>submit_post()}
			title="Submit"
			aria-label="Submit editor state">
			<Send />
		</button>
	</div>

</div>