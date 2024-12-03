<script lang="ts">
    import {Skeleton, ImagePlaceholder, TextPlaceholder} from 'svelte-5-ui-lib';
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import RichTextComposer from '$lib/components/RichTextComposer.svelte';
		// import {RichTextComposer} from 'svelte-lexical';
		import PlaygroundEditorTheme from '$lib/components/themes/PlaygroundEditorTheme';
    import type { PageData } from './$types';
		import '../../app.css';
    let { data }: { data: PageData } = $props();

</script>

<h3>Index</h3>

<p>{data.user?.username}</p>
<p>{data.api_key}</p>
<Skeleton class="py-4"/>

<RichTextComposer />
<!--<RichTextComposer theme={PlaygroundEditorTheme} />-->

<Skeleton class="py-4"/>
<ImagePlaceholder class="my-8"/>
<Skeleton class="py-4"/>
<Skeleton class="mb-8 mt-16"/>
<ImagePlaceholder class="my-8"/>
