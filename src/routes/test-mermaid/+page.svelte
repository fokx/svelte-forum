<script>
	// @ts-nocheck

	import mermaid from "mermaid";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

	let inputText = $state(``);

	let mermaidCode = $state(``);

	let processing = $state(false);

	onMount(() => {
		const renderMermaidDiagrams = async () => {
			const mermaidElements = document.querySelectorAll('pre.mermaid');
			// const codeElements = document.querySelectorAll('pre[data-code-wrap="mermaid"] > code.lang-mermaid');
			mermaidElements.forEach(async (element, index) => {
				const graphDefinition = element.textContent;
				const { svg } = await mermaid.render(`mermaid-${index}`, graphDefinition);
				element.innerHTML = svg;
			});
		};

		renderMermaidDiagrams();
	});

	let mermaidContainer = $state();
	const onImagine = async () => {
		mermaidCode = ``;
		processing = true;
		try {
				mermaidCode = inputText;
				if (browser) {
					const { svg } = await mermaid.render("mermaid", mermaidCode);
					if (mermaidContainer) {
						mermaidContainer.innerHTML = svg;
					}
				}
		} catch (error) {
			console.log("ERROR: ", error);
		} finally {
			processing = false;
		}
	};
</script>

<div >
	<div

	>
		<p class="text-xl font-bold">Create Diagrams</p>
		<textarea
			name="Usecase"
			placeholder="Usecase"
			bind:value={inputText}
			class="bg-transparent rounded-lg shadow-md border border-gray-500 min-w-[30%] min-h-[10vh] p-2"
		></textarea>
		<button onclick={onImagine} class="rounded-full px-6 py-2 shadow-lg bg-sky-500"
		>
			{#if processing}
				processing
			{:else}
				Draw
			{/if}
		</button
		>
		<div >
			{#if mermaidCode.length > 0}
				<div class="min-w-full items-center justify-center" bind:this={mermaidContainer}></div>
			{/if}
		</div>
	</div>
</div>

Here is one mermaid diagram:
<pre class="mermaid">
            graph TD
            A[Client] --> B[Load Balancer]
            B --> C[Server1]
            B --> D[Server2]
</pre>

