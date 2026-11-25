<script lang="ts">
  import DropdownMenu from "../../src/dropdown-menu.svelte";
  import DropdownMenuItem from "../../src/dropdown-menu-item.svelte";
  import DropdownMenuCheckboxItem from "../../src/dropdown-menu-checkbox-item.svelte";
  import DropdownMenuRadioGroup from "../../src/dropdown-menu-radio-group.svelte";
  import DropdownMenuRadioItem from "../../src/dropdown-menu-radio-item.svelte";
  import DropdownMenuSeparator from "../../src/dropdown-menu-separator.svelte";

  let { onSelect, onCheckedChange, onValueChange }: { onSelect?: () => void; onCheckedChange?: (v: boolean) => void; onValueChange?: (v: string) => void } =
    $props();
</script>

<DropdownMenu>
  {#snippet trigger(props)}<button type="button" {...props}>Actions</button>{/snippet}
  <DropdownMenuItem {onSelect}>Profile</DropdownMenuItem>
  <DropdownMenuItem>Billing</DropdownMenuItem>
  <DropdownMenuItem disabled>Soon</DropdownMenuItem>
  <DropdownMenuItem>Settings</DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuCheckboxItem {onCheckedChange}>Toolbar</DropdownMenuCheckboxItem>
  <DropdownMenuRadioGroup label="Sort by" value="name" {onValueChange}>
    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
  </DropdownMenuRadioGroup>
</DropdownMenu>
