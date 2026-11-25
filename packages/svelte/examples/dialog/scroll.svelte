<script lang="ts">
  import Dialog from "@/components/vin/dialog.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Dialog title="Terms of use">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Read the terms</Button>{/snippet}
  <p>VinUI is free and MIT licensed. You can use it in personal and commercial work, change it, and ship it in your own products.</p>
  <p>Keep the licence notice in copies of the source. You don't need to credit VinUI in your app, though a link is always welcome.</p>
  <p>The components come as they are, without a warranty. Test them in your own product before you ship.</p>
  <p>Fonts and icons used in the examples have their own licences. Check them before you use them.</p>
  <p>When the content is longer than the screen, the dialog scrolls inside and the page behind it stays put.</p>
  {#snippet footer(close)}
    <Button variant="outline" onclick={close}>Decline</Button>
    <Button onclick={close}>Accept</Button>
  {/snippet}
</Dialog>
