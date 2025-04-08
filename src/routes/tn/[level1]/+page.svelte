<script lang="ts">
	import type { PageData } from './$types';
	import { update_local_topic_by_topic_id } from '$lib';
	import { Spinner } from 'svelte-5-ui-lib';
	import '../../../app.css';
	import { dbb } from '$lib/dbb';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	function get_main_post_id(posts) {
		if (posts && posts.length > 0) {
			let main_post_arr = posts.filter(p => p.post_number === 1);
			if (main_post_arr.length === 1) {
				let main_post_id = main_post_arr[0].id;
				// console.log(main_post_id);
				if (main_post_id !== undefined) {
					goto(`/t/${main_post_id}`);
				}
			}
		}
	}

	async function lookup_indexeddb() {
		try {
			let posts = await dbb.posts.filter(p => p.topic_id === parseInt(data.params.level1)).toArray();
			get_main_post_id(posts);
		} catch (error) {
			console.error(error);
		}
	}

	async function get_latest_topic_by_discourse_id() {
		try {
			let posts = await update_local_topic_by_topic_id(data.params.level1);
			get_main_post_id(posts);
		} catch (error) {
			console.error(error);
		}
	}

	async function lookup_local_or_remote() {
		lookup_indexeddb();
		get_latest_topic_by_discourse_id();
	}
</script>

{#await lookup_local_or_remote()}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />
{:then error}
	Loading...
	<Spinner class="me-3" size="4" color="teal" />
{:catch error}
	<p style="color: red">Error loading topic by its Discourse ID: {error}</p>
{/await}
