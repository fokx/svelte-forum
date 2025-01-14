<script lang="ts">
	import { Button, DescriptionList, Heading, Hr, List, Spinner, Toast } from 'svelte-5-ui-lib';
	import type { PageData } from './$types';
	import { update_local_categories } from '$lib';
	import { dbb } from '$lib/dbb';
	import StarFill from 'svelte-bootstrap-svg-icons/StarFill.svelte';

	let { data }: { data: PageData } = $props();
	let syncPromise: Promise<void> | null = $state();
	let showSuccessToast = $state(false);
	let errorToast = $state(null);
	let showLoading = $state(false);

	async function update_local_categories2() {
	}


	function handleSync() {
		showLoading = true;
		Promise.all([update_local_categories(), update_local_categories2()]).then(() => {
			showSuccessToast = true;
			setTimeout(() => {
				showSuccessToast = false;
			}, 5000);
		}).catch((err) => {
			errorToast = err;
			setTimeout(() => {
				errorToast = null;
			}, 5000);
		}).finally(() => {
			showLoading = false;
		});
	}

	function clearDarkmodeOverride() {
		if ('THEME_PREFERENCE_KEY' in localStorage) {
			localStorage.removeItem('THEME_PREFERENCE_KEY');
		}
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			window.document.documentElement.classList.add('dark');
		}
		showSuccessToast = true;
		setTimeout(() => {
			showSuccessToast = false;
		}, 5000);
	}

	function handleDeleteLocalPosts() {
		showLoading = true;
		dbb.posts.clear().then(() => {
			showSuccessToast = true;
			setTimeout(() => {
				showSuccessToast = false;
			}, 5000);
		}).catch((err) => {
			errorToast = err;
			setTimeout(() => {
				errorToast = null;
			}, 5000);
		}).finally(() => {
			showLoading = false;
		});
	}


	function handleDeleteLocalUsers() {
		showLoading = true;
		dbb.users.clear().then(() => {
			showSuccessToast = true;
			setTimeout(() => {
				showSuccessToast = false;
			}, 5000);
		}).catch((err) => {
			errorToast = err;
			setTimeout(() => {
				errorToast = null;
			}, 5000);
		}).finally(() => {
			showLoading = false;
		});
	}



	function handleDeleteLocalCategories() {
		showLoading = true;
		dbb.categories.clear().then(() => {
			showSuccessToast = true;
			setTimeout(() => {
				showSuccessToast = false;
			}, 5000);
		}).catch((err) => {
			errorToast = err;
			setTimeout(() => {
				errorToast = null;
			}, 5000);
		}).finally(() => {
			showLoading = false;
		});
	}

	function handleDeleteLocalAll() {
		showLoading = true;
		localStorage.clear();
		dbb.delete().then(() => {
			showSuccessToast = true;
			setTimeout(() => {
				showSuccessToast = false;
			}, 5000);
		}).catch((err) => {
			errorToast = err;
			setTimeout(() => {
				errorToast = null;
			}, 5000);
		}).finally(() => {
			showLoading = false;
		});
	}

	const userinfo = structuredClone(data.user);
	userinfo['api_key[:4]'] = data.api_key.slice(0, 4);
</script>
<div>
	<Heading tag="h1" class="text-primary-700 dark:text-primary-500 text-xl">
		Control
	</Heading>
	<div>
		{#if showLoading}
			Executing...
			<Spinner class="me-3" size="4" color="teal" />
		{/if}
		{#if showSuccessToast}
			<Toast color="green">Success</Toast>
		{/if}
		{#if errorToast}
			<Toast color="red">Failed: {errorToast}</Toast>
		{/if}
	</div>
	<div class="my-2 flex flex-col gap-2">
		<Button class="w-64 mx-auto bg-yellow-500" onclick={clearDarkmodeOverride}>
			Clear Dark/Light Override
		</Button>

		<Button class="w-64 mx-auto bg-green-600" onclick={handleSync}>
			Sync data from Discourse
		</Button>

		<Button class="w-64 mx-auto" onclick={handleDeleteLocalPosts}>
			Remove cached posts data
		</Button>

		<Button class="w-64 mx-auto" onclick={handleDeleteLocalUsers}>
			Remove cached users data
		</Button>

		<Button class="w-64 mx-auto" onclick={handleDeleteLocalCategories}>
			Remove cached categories data
		</Button>

		<Button class="w-64 mx-auto bg-red-700" onclick={handleDeleteLocalAll}>
			Remove all local data
		</Button>
	</div>

	<Hr hrClass="my-8 max-w-5xl h-1" icon>
		<StarFill class="w-4 h-4 text-gray-700 dark:text-gray-300" />
	</Hr>

	<Heading tag="h1" class="text-primary-700 dark:text-primary-500 text-xl">
		User info
	</Heading>
	<List tag="dl" class="divide-y divide-gray-200 text-gray-900 dark:divide-gray-700  dark:text-white">
		{#each Object.entries(userinfo) as [key, value]}
			<div class="flex flex-col pb-3">
				<DescriptionList tag="dt" class="mb-1">{key}</DescriptionList>
				<DescriptionList tag="dd">{value}</DescriptionList>
			</div>
		{/each}
	</List>

</div>
