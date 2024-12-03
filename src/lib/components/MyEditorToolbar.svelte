<script lang="ts">
  import {
    BlockFormatDropDown,
    UndoButton,
    RedoButton,
    Toolbar,
    // Divider,
    ParagraphDropDownItem,
    HeadingDropDownItem,
    BulletDropDrownItem,
    NumberDropDrownItem,
    CheckDropDrownItem,
    QuoteDropDrownItem,
    CodeDropDrownItem,
    CodeLanguageDropDown,
    FontFamilyDropDown,
    // FontSizeDropDown,
    FontSizeEntry,
    BoldButton,
    ItalicButton,
    UnderlineButton,
    InsertLink,
    FormatCodeButton,
    InsertDropDown,
    DropDownAlign,
    InsertHRDropDownItem,
    InsertImageDropDownItem,
    MoreStylesDropDown,
    StrikethroughDropDownItem,
    SubscriptDropDownItem,
    SuperscriptDropDownItem,
    ClearFormattingDropDownItem,
    DropDownTextColorPicker,
    DropDownBackColorPicker,
    InsertColumnLayoutDropDownItem,
    InsertColumnsDialog,
  } from 'svelte-lexical';
  import InsertImageDialog from '$lib/components/InsertImageDialog.svelte';

  let imageDialog: InsertImageDialog = $state();
  let columnsDialog: InsertColumnsDialog = $state();
</script>

<Toolbar   >
  {#snippet children({ editor, activeEditor, blockType })}
    <UndoButton />
    <RedoButton />
    {#if activeEditor === editor}
      <BlockFormatDropDown>
        <ParagraphDropDownItem />
        <HeadingDropDownItem headingSize="h1" />
        <HeadingDropDownItem headingSize="h2" />
        <HeadingDropDownItem headingSize="h3" />
        <BulletDropDrownItem />
        <NumberDropDrownItem />
        <CheckDropDrownItem />
        <QuoteDropDrownItem />
        <CodeDropDrownItem />
      </BlockFormatDropDown>
    {/if}
    {#if blockType === 'code'}
      <CodeLanguageDropDown />
    {:else}
      <BoldButton />
      <ItalicButton />
      <UnderlineButton />
      <FormatCodeButton />
      {#if activeEditor === editor}
        <InsertDropDown>
          <InsertHRDropDownItem />
          <InsertImageDropDownItem on:click={() => imageDialog.open()} />
          <InsertColumnLayoutDropDownItem on:click={() => columnsDialog.open()} />
        </InsertDropDown>
      {/if}
      <DropDownTextColorPicker />
      <DropDownBackColorPicker />
      <InsertLink />
      <MoreStylesDropDown>
        <StrikethroughDropDownItem />
        <SubscriptDropDownItem />
        <SuperscriptDropDownItem />
        <ClearFormattingDropDownItem />
      </MoreStylesDropDown>
      <FontFamilyDropDown />
      <!-- <FontSizeDropDown /> -->
      <FontSizeEntry />
    {/if}
    <DropDownAlign />
    <InsertImageDialog bind:this={imageDialog} />
    <InsertColumnsDialog bind:this={columnsDialog} />
  {/snippet}
</Toolbar>
