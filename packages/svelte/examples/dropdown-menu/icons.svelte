<script lang="ts">
  import DropdownMenu from "@/components/vin/dropdown-menu.svelte";
  import DropdownMenuItem from "@/components/vin/dropdown-menu-item.svelte";
  import DropdownMenuSeparator from "@/components/vin/dropdown-menu-separator.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<DropdownMenu align="end">
  {#snippet trigger(props)}
    <Button variant="ghost" size="icon" aria-label="File actions" {...props}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
    </Button>
  {/snippet}
  <DropdownMenuItem>
    {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8l-4 1 1-4Z" /></svg>{/snippet}
    Rename
  </DropdownMenuItem>
  <DropdownMenuItem>
    {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>{/snippet}
    Duplicate
  </DropdownMenuItem>
  <DropdownMenuItem>
    {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></svg>{/snippet}
    Download
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem danger>
    {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>{/snippet}
    Delete
  </DropdownMenuItem>
</DropdownMenu>
