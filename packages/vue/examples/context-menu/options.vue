<script setup lang="ts">
import ContextMenu from "@/components/vin/context-menu.vue";
import {
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/vin/dropdown-menu.vue";
</script>

<template>
  <ContextMenu label="View options" style="width: 100%; max-width: 360px">
    Right-click for view options
    <template #content>
      <DropdownMenuItem shortcut="⌘[">Back</DropdownMenuItem>
      <DropdownMenuItem shortcut="⌘R">Reload</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Show</DropdownMenuLabel>
      <DropdownMenuCheckboxItem default-checked>Bookmarks bar</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem>Full URLs</DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup label="Zoom" default-value="100">
        <DropdownMenuLabel>Zoom</DropdownMenuLabel>
        <DropdownMenuRadioItem value="90">90%</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="100">100%</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="125">125%</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </template>
  </ContextMenu>
</template>
