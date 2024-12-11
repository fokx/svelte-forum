<script lang="ts">
	// this is /t/{slug}/{topic_id} route, same as Discourse

	import type { PageData } from './$types';
	import { dbb } from '$lib/dbb';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	onMount(() => {
		// level1 is the slug, level2 is the topic_id
		goto(`/t/${data.params.level2}`);
	});
</script>

