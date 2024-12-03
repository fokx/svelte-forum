<script lang="ts">
	import { onMount } from 'svelte';
	import type { LexicalEditor } from 'svelte-lexical';
	import { getEditor, PLAYGROUND_TRANSFORMERS } from 'svelte-lexical';
	import RichTextComposer from '$lib/components/MyRichTextComposer.svelte';
	// import {RichTextComposer} from 'svelte-lexical';
	import type { PageData } from './$types';
	import '../../app.css';
	import { Send } from 'svelte-bootstrap-svg-icons';
	import {$convertFromMarkdownString as convertFromMarkdownString, $convertToMarkdownString as convertToMarkdownString, TRANSFORMERS} from '@lexical/markdown';

	let { data }: { data: PageData } = $props();

	let composerComponent;

	const editor: LexicalEditor = getEditor();
	// onMount(() => {
	// 	const editor = composerComponent.getEditor();
	// 	editor.registerUpdateListener(({ editorState }) => {
	// 		console.log(JSON.stringify(editorState));
	// 	});
	// });
	function submit() {
		const editor = composerComponent.getEditor();
		console.log(JSON.stringify(editor.getEditorState()));
		let markdown;
		editor.update(() => {
			markdown = convertToMarkdownString(
				PLAYGROUND_TRANSFORMERS,
				undefined,
				true,
			);

		});
		console.log(markdown);
	}
	onMount(() => {
		console.log(data.user);
		console.log(data.api_key);
	});
</script>

<!--<h3>Index</h3>-->
<p>{data.user?.username}</p>
<p>{data.api_key}</p>

<RichTextComposer bind:this={composerComponent} />
<div class="actionbar">
	<!--				<ImportButton />-->
	<!--				<ExportButton />-->
	<!--				<ReadonlyButton />-->
	<button
		class="action-button submit"
		onclick={submit}
		title="Submit"
		aria-label="Submit editor state">
		<!--	<i class="submit"></i>-->
		<Send />
	</button>
</div>
