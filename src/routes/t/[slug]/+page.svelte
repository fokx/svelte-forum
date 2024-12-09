<script lang="ts">
	import { onMount } from 'svelte';
	import { Textarea , Select} from 'svelte-5-ui-lib';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	onMount(() => {
	});
</script>

<!--<h3>Index</h3>-->
<p>{data.user?.username}</p>
<p>{data.api_key}</p>

