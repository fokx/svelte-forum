<script lang="ts">
	import { onMount } from 'svelte';
	import {Textarea} from 'svelte-5-ui-lib';
	import type { LexicalEditor } from 'svelte-lexical';
	import { getEditor, PLAYGROUND_TRANSFORMERS } from 'svelte-lexical';
	import RichTextComposer from '$lib/components/MyRichTextComposer.svelte';
	// import {RichTextComposer} from 'svelte-lexical';
	import type { PageData } from './$types';
	import '../../app.css';
	import { Send } from 'svelte-bootstrap-svg-icons';
	import {$convertFromMarkdownString as convertFromMarkdownString, $convertToMarkdownString as convertToMarkdownString, TRANSFORMERS} from '@lexical/markdown';
	import { post_url } from '$lib';

	let { data }: { data: PageData } = $props();
	let title = $state('');

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
				true,
			);
		});
		console.log(markdown);
		console.log(title);
		if (!title || !markdown) {
			return;
		}
		let body = {
			"title": title,
			"raw": markdown,
		}
		let response = await post_url(data.api_key,data.user.username, '/posts.json', JSON.stringify(body));
		console.log(response);
	}
	onMount(() => {
		console.log(data.user);
		console.log(data.api_key);
	});
</script>

<!--<h3>Index</h3>-->
<p>{data.user?.username}</p>
<p>{data.api_key}</p>

<form>
	<div class="flex items-center rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">
		<Textarea bind:value={title} id="title" class="mx-4 bg-white dark:bg-gray-800" rows={1} placeholder="Your post title..." />
	</div>
</form>
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
