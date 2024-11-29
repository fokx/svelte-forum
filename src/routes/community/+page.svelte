<script lang="ts">
    import {Skeleton, ImagePlaceholder, TextPlaceholder} from 'svelte-5-ui-lib';
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();

</script>

<h3>Community</h3>
<h4>All posts</h4>
<p>{data.user?.username}</p>
<p>{data.api_key}</p>
<Skeleton class="py-4"/>
<ImagePlaceholder class="my-8"/>
<Skeleton class="py-4"/>
<Skeleton class="mb-8 mt-16"/>
<ImagePlaceholder class="my-8"/>
