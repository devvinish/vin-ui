<script lang="ts">
  import Item from "@/components/vin/item.svelte";
</script>

<div style="display: grid; gap: 8px; width: 100%; max-width: 420px">
  <Item variant="outline" href="#profile" title="Profile" description="Name, photo and email">
    {#snippet media()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>{/snippet}
    {#snippet actions()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>{/snippet}
  </Item>
  <Item variant="outline" href="#notifications" title="Notifications" description="Email and push">
    {#snippet media()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>{/snippet}
    {#snippet actions()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>{/snippet}
  </Item>
</div>
