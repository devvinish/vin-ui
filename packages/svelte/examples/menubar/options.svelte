<script lang="ts">
  import Menubar from "@/components/vin/menubar.svelte";
  import MenubarMenu from "@/components/vin/menubar-menu.svelte";
  import DropdownMenuItem from "@/components/vin/dropdown-menu-item.svelte";
  import DropdownMenuCheckboxItem from "@/components/vin/dropdown-menu-checkbox-item.svelte";
  import DropdownMenuLabel from "@/components/vin/dropdown-menu-label.svelte";
  import DropdownMenuRadioGroup from "@/components/vin/dropdown-menu-radio-group.svelte";
  import DropdownMenuRadioItem from "@/components/vin/dropdown-menu-radio-item.svelte";
  import DropdownMenuSeparator from "@/components/vin/dropdown-menu-separator.svelte";
</script>

<Menubar label="Browser">
  <MenubarMenu label="Show">
    <DropdownMenuCheckboxItem checked>Bookmarks bar</DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem>Full URLs</DropdownMenuCheckboxItem>
  </MenubarMenu>
  <MenubarMenu label="Profiles">
    <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
    <DropdownMenuRadioGroup label="Profile" value="ada">
      <DropdownMenuRadioItem value="ada">Ada</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="grace">Grace</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="linus">Linus</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Add profile…</DropdownMenuItem>
  </MenubarMenu>
</Menubar>
