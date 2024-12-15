<script lang="ts">
	// /t/{topic_id} route

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Post from '$lib/components/Post.svelte';
	import { fetch_post_by_external_id, update_local_topic_by_external_id } from '$lib';
	import { Spinner, Card} from 'svelte-5-ui-lib';
	import '../../../app.css';
	import { dbb } from '$lib/dbb';

	let { data }: { data: PageData } = $props();
	let threaded_view = $state(true);

	async function load_or_fetch_this_post() {
		let _this_post = await dbb.posts.get(data.params.level1);
		if (_this_post === undefined || _this_post === null) {
			_this_post = await fetch_post_by_external_id(data.params.level1);
		} else {
			// update all posts under this topic
			let posts = await update_local_topic_by_external_id(_this_post.main_post_id);
		}
		return _this_post;
	}

	onMount(() => {
	});
</script>


{#await load_or_fetch_this_post()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />
{:then this_post}
	{#if this_post}
		<Card
			size="sm"
			color="amber"
			shadow="sm"
			padding="sm"
		>
			<p>you are viewing a single comment's thread.</p>
			<p><a style="color: blue" href={`/t/${this_post.main_post_id}`}>view the rest of the comments →</a></p>
		</Card>
		<Post post={this_post} expand={true} />
	{/if}
	<!--	loaded-->
{:catch error}
	<p style="color: red">Topic cannot be loaded with {error.message}</p>
{/await}

