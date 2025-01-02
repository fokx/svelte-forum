<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { PageData } from './$types';
	import Post from '$lib/components/Post.svelte';
	import { update_local_topic_by_external_id } from '$lib';
	import { Spinner } from 'svelte-5-ui-lib';
	import '../../../app.css';
	import { liveQuery } from 'dexie';
	import { dbb } from '$lib/dbb';
	import { browser } from '$app/environment';
	import mermaid from 'mermaid';
	// onMount(async () => {
	// 	let flatViewChecked = localStorage.getItem('FLAT_VIEW') === 'true';
	// 	if (browser) {
	// 		dbb.rgv.put({ name: 'preference_flat_view', value: flatViewChecked.toString() });
	// 	}
	// });
	let { data }: { data: PageData } = $props();

	let topic_posts = liveQuery(() =>
		dbb.posts.filter(p => p.main_post_id === data.params.level1).toArray()
			.then(a => a.sort((a, b) => a.post_number < b.post_number ? -1 : 1))
	);

	async function load_or_fetch_topic_posts() {
		let posts = await update_local_topic_by_external_id(data.params.level1);
		return posts;
	}
	import { siteTitle } from '$lib/stores';
	import hljs from 'highlight.js';
	import {
		convertToMarkdownString,
		PLAYGROUND_TRANSFORMERS
	} from '../../../../../svelte-lexical/packages/svelte-lexical';
	$effect(() => {
		if (browser) {
			// TODO: ingnore mermaid in highlight.js
			hljs.highlightAll();
			hljs.configure({ ignoreUnescapedHTML: true });
			// document.querySelectorAll('pre code').forEach((el) => {
			// 	hljs.highlightElement(el);
			// });
		}
		if (browser && $topic_posts && $topic_posts.length > 0) {
			let title = $topic_posts[0].title;
			siteTitle.set(title);
		}
		// if (isRendered) {
		// 	return;
		// }
		// isRendered = true;
		// const renderMermaidDiagrams = async () => {
		// 	const element = document.querySelectorAll('pre[data-code-wrap="mermaid"] > code.lang-mermaid').at(-1);
		// 		const graphDefinition = element.textContent;
		// 		if (graphDefinition) {
		// 			const { svg } = await mermaid.render(`mermaid`, graphDefinition);
		// 			element.innerHTML = svg;
		// 			element.classList.remove('lang-mermaid'); // Remove the class to prevent re-selection
		// 			element.classList.add('mermaid-rendered'); // Optionally add a new class to indicate it has been rendered
		// 		}
		// };

		const renderMermaidDiagrams = async () => {
			const mermaidElements = document.querySelectorAll('pre[data-code-wrap="mermaid"] > code.lang-mermaid');
			console.log('mermaidElements', mermaidElements);
			let prev_n_str = localStorage.getItem('mermaidElementsNum');
			if (prev_n_str === null) {
				prev_n_str = '0';
			}
			let prev_n = parseInt(prev_n_str);
			let cur_n = mermaidElements.length;
			if (cur_n > prev_n) {
				localStorage.setItem('mermaidElementsNum', cur_n.toString());
			} else {
				localStorage.setItem('mermaidElementsNum', '0');
			}

			const renderPromises = Array.from(mermaidElements).map(async (element, index) => {
				console.log('render 1');
				const graphDefinition = element.textContent;
				if (graphDefinition) {
					const { svg } = await mermaid.render(`mermaid-${index}`, graphDefinition);
					if (element.classList.contains('lang-mermaid')) {
						element.innerHTML = svg;
						console.log('svg', svg);
						element.classList.remove('lang-mermaid'); // Remove the class to prevent re-selection
						element.classList.add('mermaid-rendered'); // Optionally add a new class to indicate it has been rendered
					} else {
						console.log('skip');
					}
				}
			});
			await Promise.all(renderPromises);
		};
		renderMermaidDiagrams();

	});
	let grv_preference_flat_view = liveQuery(() =>
		dbb.rgv.get('preference_flat_view')
	);
</script>

{#await load_or_fetch_topic_posts()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />
{:then posts}
	{#if !posts}
		<p style="color: red">Topic not found</p>
	{/if}
{:catch error}
	<p style="color: red">Topic cannot be loaded with {error.message}</p>
{/await}

{#if $topic_posts && $topic_posts.length > 0}
	{#if $grv_preference_flat_view?.value !== 'true'}
		<Post post={$topic_posts[0]} expand={true} />
	{:else}
		{#each $topic_posts as post}
			{#if post}
				<Post post={post} />
			{:else}
				<p>Post not found</p>
			{/if}
		{/each}
	{/if}
{/if}
