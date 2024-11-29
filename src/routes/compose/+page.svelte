<script lang="ts">
    import {Skeleton, ImagePlaceholder, TextPlaceholder} from 'svelte-5-ui-lib';
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import RichTextComposer from '$lib/components/RichTextComposer.svelte';
    import type { PageData } from './$types';
		import '../../app.css';
    let { data }: { data: PageData } = $props();

</script>

<h3>Index</h3>

<p>{data.user?.username}</p>
<p>{data.api_key}</p>

<RichTextComposer />
