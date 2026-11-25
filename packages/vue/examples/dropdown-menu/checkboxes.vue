<script setup lang="ts">
import DropdownMenu, {
  DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
} from "@/components/vin/dropdown-menu.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <DropdownMenu>
    <template #trigger><Button variant="outline">View</Button></template>
    <DropdownMenuLabel>Show</DropdownMenuLabel>
    <DropdownMenuCheckboxItem default-checked>Toolbar</DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem>Status bar</DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
    <DropdownMenuRadioGroup label="Sort by" default-value="name">
      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="date">Date modified</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenu>
</template>
