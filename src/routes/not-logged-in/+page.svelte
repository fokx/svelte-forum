<script lang="ts">
	import { PUBLIC_DISCOURSE_HOST } from '$env/static/public';
	import {Card, Button} from 'svelte-5-ui-lib';
	// import type { PageData } from './$types';
	// import { goto } from '$app/navigation';
	// let { data }: { data: PageServerData } = $props();
	// if (data.user) {
	// 	goto('/community');
	// }
</script>


<div class="flex justify-center">
	<Card class="text-center" size="lg" padding="xl">
		<h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Not logged in yet</h5>
		<div class="items-center justify-center space-y-4 sm:flex sm:space-x-4 sm:space-y-0 rtl:space-x-reverse">
			<Button href={PUBLIC_DISCOURSE_HOST}>Login</Button>
		</div>
	</Card>
</div>


