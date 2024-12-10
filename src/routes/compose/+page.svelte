<script lang="ts">
	import { onMount } from 'svelte';
	import { Label, Select, Textarea } from 'svelte-5-ui-lib';
	import type { LexicalEditor } from 'svelte-lexical';
	import { convertToMarkdownString, getEditor, PLAYGROUND_TRANSFORMERS } from 'svelte-lexical';
	import RichTextComposer from '$lib/components/MyRichTextComposer.svelte';
	// import {RichTextComposer} from 'svelte-lexical';
	import type { PageData } from './$types';
	import '../../app.css';
	import Send from 'svelte-bootstrap-svg-icons/Send.svelte';
	import { get_url, post_url } from '$lib';
	import { dbd } from '$lib/dbd';
	import { goto } from '$app/navigation';
	import { PUBLIC_MAX_TITLE_LENGTH } from '$env/static/public';

	let { data }: { data: PageData } = $props();
	let title = $state('');
	const DEFAULT_CATEGORY_ID = 4;
	let category = $state(DEFAULT_CATEGORY_ID);

	async function get_local_categories_fetch_if_not_exists() {
		let categories = dbd.categories.toArray();
		if (categories.length > 0) {
			return categories;
		} else {
			let response = await get_url(data.user.username, data.api_key, '/categories.json');
			if (response.status === 200) {
				response = await response.json();
				let categories = response.category_list.categories;
				for (let cat of categories) {
					dbd.categories.add({
						id: cat.id,
						name: cat.name,
						color: cat.color,
						text_color: cat.text_color,
						slug: cat.slug,
						topic_count: cat.topic_count,
						post_count: cat.post_count,
						position: cat.position,
						description: cat.description,
						topic_url: cat.topic_url
					});
				}
				return categories;
			}
		}
	}

	let composerComponent;
	const editor: LexicalEditor = getEditor();
	// onMount(() => {
	// 	const editor = composerComponent.getEditor();
	// 	editor.registerUpdateListener(({ editorState }) => {
	// 	});
	// });
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
			return;
		}
		let body = {
			'title': title,
			'raw': markdown,
			'category': category // 3: admin only
			// 'category': 4, // 4: general
		};

		let response = await post_url(data.user.username, data.api_key, '/posts.json', JSON.stringify(body));
		if (response.status === 200) {
			alert('Post submitted successfully!');
			response = await response.json();
			goto(`/t/${response.topic_slug}/${response.topic_id}`);
		} else {
			alert('Failed to submit post!');
		}
	}

	onMount(() => {
	});
</script>

<form class="flex items-center space-x-4">
	<div class="flex-1">
		<Textarea bind:value={title} id="title" class="bg-white dark:bg-gray-800 w-full" rows={1}
							placeholder="Your post title (max {PUBLIC_MAX_TITLE_LENGTH})..." maxlength={PUBLIC_MAX_TITLE_LENGTH} />
	</div>
	<div>
		<Label for="categories" class="mt-2">category:</Label>
		<Select id="categories" class="mt-2" bind:value={category} placeholder="">
			{#await get_local_categories_fetch_if_not_exists()}
				<option value={DEFAULT_CATEGORY_ID}>Default category</option>
			{:then categories}
				{#each categories as cat}
					<option selected={cat.id===DEFAULT_CATEGORY_ID} value={cat.id} style="color:#{cat.color}">{cat.name}</option>
				{/each}
			{:catch error}
				<p style="color: red">can not fetch category info: {error.message}</p>
			{/await}
		</Select>
	</div>
</form>



<RichTextComposer bind:this={composerComponent} />
<div class="actionbar">
	<!--				<ImportButton />-->
	<!--				<ExportButton />-->
	<!--				<ReadonlyButton />-->
	<button
		class="action-button submit"
		onclick={() =>submit_post()}
		title="Submit"
		aria-label="Submit editor state">
		<!--	<i class="submit"></i>-->
		<Send />
	</button>
</div>
