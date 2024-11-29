<script lang="ts">
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
    onMount(() => {
        goto('/community');
    });
</script>

