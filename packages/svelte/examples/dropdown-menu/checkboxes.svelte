<script lang="ts">
  import DropdownMenu from "@/components/vin/dropdown-menu.svelte";
  import DropdownMenuCheckboxItem from "@/components/vin/dropdown-menu-checkbox-item.svelte";
  import DropdownMenuLabel from "@/components/vin/dropdown-menu-label.svelte";
  import DropdownMenuRadioGroup from "@/components/vin/dropdown-menu-radio-group.svelte";
  import DropdownMenuRadioItem from "@/components/vin/dropdown-menu-radio-item.svelte";
  import DropdownMenuSeparator from "@/components/vin/dropdown-menu-separator.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<DropdownMenu>
  {#snippet trigger(props)}<Button variant="outline" {...props}>View</Button>{/snippet}
  <DropdownMenuLabel>Show</DropdownMenuLabel>
  <DropdownMenuCheckboxItem checked>Toolbar</DropdownMenuCheckboxItem>
  <DropdownMenuCheckboxItem>Status bar</DropdownMenuCheckboxItem>
  <DropdownMenuSeparator />
  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
  <DropdownMenuRadioGroup label="Sort by" value="name">
    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="date">Date modified</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
  </DropdownMenuRadioGroup>
</DropdownMenu>
