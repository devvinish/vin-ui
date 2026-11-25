<script lang="ts">
  import InputGroup from "@/components/vin/input-group.svelte";
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
  <InputGroup type="search" placeholder="Search docs" aria-label="Search docs" end="⌘K">
    {#snippet start()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>{/snippet}
  </InputGroup>
  <InputGroup label="Email" type="email" placeholder="you@example.com" error="Enter a valid email address.">
    {#snippet start()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>{/snippet}
  </InputGroup>
</div>
