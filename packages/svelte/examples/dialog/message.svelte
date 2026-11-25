<script lang="ts">
  import Dialog from "@/components/vin/dialog.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Dialog title="Your site is live" description="Anyone with the link can see it now. It can take a minute to show up everywhere.">
  {#snippet trigger(props)}<Button {...props}>Publish</Button>{/snippet}
  {#snippet footer(close)}<Button onclick={close}>Got it</Button>{/snippet}
</Dialog>
