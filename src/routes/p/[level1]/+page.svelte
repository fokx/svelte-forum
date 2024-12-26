<script lang="ts">
	// /t/{topic_id} route

	import type { PageData } from './$types';
	import Post from '$lib/components/Post.svelte';
	import { convertHtmlToText, fetch_post_by_external_id, update_local_topic_by_external_id } from '$lib';
	import { Card, Spinner } from 'svelte-5-ui-lib';
	import '../../../app.css';
	import { dbb } from '$lib/dbb';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	let isThreadedView = $state(true);
	onMount(async () => {
		isThreadedView = localStorage.getItem('THREADED_VIEW') === 'true';
	});
	async function load_or_fetch_this_post() {
		let _this_post = await dbb.posts.get(data.params.level1);
		if (_this_post === undefined || _this_post === null) {
			_this_post = await fetch_post_by_external_id(data.params.level1);
		} else {
			// update all posts under this topic (in the background)
			update_local_topic_by_external_id(_this_post.main_post_id);
		}
		if (browser && _this_post) {
			let title = convertHtmlToText(_this_post.cooked);
			dbb.rgv.put({ name: 'title', value: title });
		}
		return _this_post;
	}

</script>


{#await load_or_fetch_this_post()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />
{:then this_post}
	{#if this_post}
		<Card
			class="max-w-3xl mb-2 bg-[#ffdfa8] dark:bg-[#614B26FF]"
			shadow="sm"
			padding="sm"
		>
			<p>you are viewing a single comment's thread.</p>
			<p><a class="text-blue-800 dark:text-blue-500" href={`/t/${this_post.main_post_id}`}>view the rest of the comments
				→</a></p>
		</Card>
		<Post post={this_post} expand={true} />
	{:else}
		<p style="color: red">Post not found</p>
	{/if}
	<!--	loaded-->
{:catch error}
	<p style="color: red">Topic cannot be loaded with {error.message}</p>
{/await}

