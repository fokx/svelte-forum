<script lang="ts">
	import { Button, Spinner, Toast } from 'svelte-5-ui-lib';
	import type { PageData } from './$types';
	import { get_url } from '$lib';
	import { dbd } from '$lib/dbd';

	let { data }: { data: PageData } = $props();
	let syncPromise: Promise<void> | null = $state();
	let showToast = $state(false);

	async function sync_data_from_discourse() {
		await Promise.all([update_local_categories(), update_local_categories2()]);
	}

	async function update_local_categories2() {
		// console.log('update_local_categories2');
	}

	async function update_local_categories() {
		let categories = dbd.categories.toArray();
		if (categories.length > 0) {
			let response = await get_url(data.user.username, data.api_key, '/categories.json');
			if (response.status === 200) {
				response = await response.json();
				let categories = response.category_list.categories;
				for (let cat of categories) {
					dbd.categories.update(cat.id, {
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
			}
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
			}
		}
	}

	function handleSync() {
		syncPromise = sync_data_from_discourse();
		syncPromise.then(() => {
			showToast = true;
			setTimeout(() => {
				showToast = false;
			}, 5000);
		});
	}
</script>

<h3>Settings</h3>
<p>{data.user?.username}</p>
<p>{data.api_key}</p>

<Button onclick={handleSync}>
	Sync data from Discourse
</Button>

{#if syncPromise}
	{#await syncPromise}
		<Spinner class="me-3" size="4" color="teal" />
	{:then ret}
		{#if showToast}
			<Toast>Success</Toast>
		{/if}
	{:catch error}
		<p style="color: red">Failed: {error.message}</p>
	{/await}
{/if}