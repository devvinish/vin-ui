<script lang="ts">
  import ContextMenu from "../../src/context-menu.svelte";
  import DropdownMenuItem from "../../src/dropdown-menu-item.svelte";
  import DropdownMenuCheckboxItem from "../../src/dropdown-menu-checkbox-item.svelte";

  let { onSelect, onOpenChange }: { onSelect?: () => void; onOpenChange?: (open: boolean) => void } = $props();
</script>

<ContextMenu label="File actions" {onOpenChange}>
  Right-click here
  {#snippet content()}
    <DropdownMenuItem {onSelect}>Rename</DropdownMenuItem>
    <DropdownMenuItem disabled>Move</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuCheckboxItem>Pinned</DropdownMenuCheckboxItem>
  {/snippet}
</ContextMenu>
