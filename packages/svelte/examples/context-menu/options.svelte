<script lang="ts">
  import ContextMenu from "@/components/vin/context-menu.svelte";
  import DropdownMenuItem from "@/components/vin/dropdown-menu-item.svelte";
  import DropdownMenuCheckboxItem from "@/components/vin/dropdown-menu-checkbox-item.svelte";
  import DropdownMenuRadioGroup from "@/components/vin/dropdown-menu-radio-group.svelte";
  import DropdownMenuRadioItem from "@/components/vin/dropdown-menu-radio-item.svelte";
  import DropdownMenuLabel from "@/components/vin/dropdown-menu-label.svelte";
  import DropdownMenuSeparator from "@/components/vin/dropdown-menu-separator.svelte";
</script>

<ContextMenu label="View options" style="width: 100%; max-width: 360px">
  Right-click for view options
  {#snippet content()}
    <DropdownMenuItem shortcut="⌘[">Back</DropdownMenuItem>
    <DropdownMenuItem shortcut="⌘R">Reload</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Show</DropdownMenuLabel>
    <DropdownMenuCheckboxItem checked>Bookmarks bar</DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem>Full URLs</DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup label="Zoom" value="100">
      <DropdownMenuLabel>Zoom</DropdownMenuLabel>
      <DropdownMenuRadioItem value="90">90%</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="100">100%</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="125">125%</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  {/snippet}
</ContextMenu>
