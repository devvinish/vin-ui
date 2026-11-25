<script lang="ts">
  import Empty from "@/components/vin/empty.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Empty variant="outline" style="max-width: 420px" title="Drop files here" description="PNG, JPG or PDF, up to 10 MB each.">
  {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>{/snippet}
  {#snippet actions()}<Button variant="outline" size="sm">Choose files</Button>{/snippet}
</Empty>
