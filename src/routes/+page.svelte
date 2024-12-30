<script lang="ts">
	import type { PageData } from './$types';
	import { dbb } from '$lib/dbb';
	import { scrollable_main_class, update_latest_topics } from '$lib';
	import Topic from '$lib/components/Topic.svelte';
	import { Spinner } from 'svelte-5-ui-lib';
	import { liveQuery } from 'dexie';
	import { onMount, tick } from 'svelte';

	let { data }: { data: PageData } = $props();
	let latest_topics = liveQuery(() =>
		dbb.posts.orderBy('last_posted_at').filter(p => p.post_number === 1).desc().toArray()
	);

	async function load_or_fetch_latest_topics() {
		let topics = await update_latest_topics();
		return topics;
	}

	let page_to_fetch: number;
	let loading_new_page: boolean = $state(false);
	let viewport: HTMLElement;
	let last_updated_date:Date=$state(new Date());

	onMount(() => {
		page_to_fetch = 1;
		viewport.addEventListener('scroll', () => alarm.setup());
	});

	const alarm = {
		remind(aMessage) {
			if (viewport && viewport.offsetHeight + viewport.scrollTop > viewport.scrollHeight - 50) {
				viewport.scrollTop -= 60;
				// viewport.scrollTo(0, viewport.scrollHeight - 60);
				update_latest_topics(page_to_fetch);
				page_to_fetch += 1;
			}
			last_updated_date = new Date();
			loading_new_page = false;
			this.timeoutID = undefined;
		},

		setup() {
			if (typeof this.timeoutID === 'number') {
				this.cancel();
			}
			if (viewport && viewport.offsetHeight + viewport.scrollTop > viewport.scrollHeight - 50) {
				loading_new_page = true;
				this.timeoutID = setTimeout(
					(msg) => {
						this.remind(msg);
					},
					500,
					'alarm msg'
				);
			}
		},

		cancel() {
			clearTimeout(this.timeoutID);
		}
	};


</script>

{#snippet loading(text = 'loading')}
	<p>
		<span>{text}</span>
		<Spinner class="me-3" size="4" color="teal" />
	</p>
{/snippet}
{#await load_or_fetch_latest_topics()}
	<!--{@render loading('Updating latest topics')}-->
<!--{:then topics}-->
<!--	<p>Last updated at {last_updated_date.toLocaleString()}</p>-->
<!--{:catch error}-->
<!--	<p style="color: red">Error loading latest topics: {error.message}</p>-->
{/await}

{#if loading_new_page}
	{@render loading(`Fetching new topics on page ${page_to_fetch}`)}
{:else}
	<p>Last updated at {last_updated_date.toLocaleString()}</p>
{/if}

<div class={scrollable_main_class} id="scrollable-element" bind:this={viewport}>
	{#if $latest_topics && $latest_topics.length > 0}

		<ul>
			{#each $latest_topics as topic}
				<div>
					<Topic post={topic} />
				</div>
			{/each}
		</ul>
	{:else}
		<p class="text-gray-900 dark:text-white">No topics found</p>
	{/if}
</div>
