<script setup lang="ts">
import Menubar, { MenubarMenu } from "@/components/vin/menubar.vue";
import {
  DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
} from "@/components/vin/dropdown-menu.vue";
</script>

<template>
  <Menubar label="Browser">
    <MenubarMenu label="Show">
      <DropdownMenuCheckboxItem default-checked>Bookmarks bar</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem>Full URLs</DropdownMenuCheckboxItem>
    </MenubarMenu>
    <MenubarMenu label="Profiles">
      <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
      <DropdownMenuRadioGroup label="Profile" default-value="ada">
        <DropdownMenuRadioItem value="ada">Ada</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="grace">Grace</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="linus">Linus</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Add profile…</DropdownMenuItem>
    </MenubarMenu>
  </Menubar>
</template>
