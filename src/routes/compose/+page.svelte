<script lang="ts">
	import { onMount } from 'svelte';
	import { Label, Select, Textarea } from 'svelte-5-ui-lib';
	import type { LexicalEditor } from 'svelte-lexical';
	import { convertToMarkdownString, getEditor, PLAYGROUND_TRANSFORMERS } from 'svelte-lexical';
	import RichTextComposer from '$lib/components/MyRichTextComposer.svelte';
	// import {RichTextComposer} from 'svelte-lexical';
	import type { PageData } from './$types';
	import '../../app.css';
	import { Send } from 'svelte-bootstrap-svg-icons';
	import { get_url, post_url } from '$lib';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let title = $state('');
	let category = $state(4);

	async function get_categories() {
		let response = await get_url(data.user.username, data.api_key, '/categories.json');
		if (response.status === 200) {
			response = await response.json();
			console.log(response);
			let categories = response.category_list.categories;
			return categories;
		}
	}

	let composerComponent;
	const editor: LexicalEditor = getEditor();
	// onMount(() => {
	// 	const editor = composerComponent.getEditor();
	// 	editor.registerUpdateListener(({ editorState }) => {
	// 		console.log(JSON.stringify(editorState));
	// 	});
	// });
	async function submit() {
		const editor = composerComponent.getEditor();
		// console.log(JSON.stringify(editor.getEditorState()));
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
			'category': 3 // 3: admin only
			// 'category': 4, // 4: general
		};

		let response = await post_url(data.user.username, data.api_key, '/posts.json', JSON.stringify(body));
		console.log(response);
		if (response.status === 200) {
			alert('Post submitted successfully!');
			response = await response.json();
			console.log(response);
			console.log(response.cooked);
			goto(`/t/${response.topic_slug}/${response.topic_id}`);
		} else {
			alert('Failed to submit post!');
		}
	}

	onMount(() => {
	});
</script>

<!--<h3>Index</h3>-->
<p>{data.user?.username}</p>
<p>{data.api_key}</p>

<form>
	<div class="flex items-center rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">
		<Textarea bind:value={title} id="title" class="mx-4 bg-white dark:bg-gray-800" rows={1}
							placeholder="Your post title..." />
	</div>
</form>

<div>
	<Label for="categories">Select post category</Label>
	<Select id="categories" class="mt-2" bind:value={category} placeholder="">
		<option selected value={category}>Default</option>
		{#await get_categories()}
			<p>Post to default category</p>
		{:then categories}
			{#each categories as cat}
				<option value={cat.id} style="color:#{cat.color}">{cat.name}</option>
			{/each}
		{:catch error}
			<p style="color: red">can not fetch category info: {error.message}</p>
		{/await}
	</Select>
</div>


<RichTextComposer bind:this={composerComponent} />
<div class="actionbar">
	<!--				<ImportButton />-->
	<!--				<ExportButton />-->
	<!--				<ReadonlyButton />-->
	<button
		class="action-button submit"
		onclick={() =>submit()}
		title="Submit"
		aria-label="Submit editor state">
		<!--	<i class="submit"></i>-->
		<Send />
	</button>
</div>
