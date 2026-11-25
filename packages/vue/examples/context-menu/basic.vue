<script setup lang="ts">
import ContextMenu from "@/components/vin/context-menu.vue";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/vin/dropdown-menu.vue";
</script>

<template>
  <ContextMenu label="File actions" style="width: 100%; max-width: 360px">
    Right-click here, or focus and press Shift+F10
    <template #content>
      <DropdownMenuItem>
        <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8l-4 1 1-4Z" /></svg></template>
        Rename
      </DropdownMenuItem>
      <DropdownMenuItem>
        <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></template>
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem>
        <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg></template>
        Copy link
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem danger>
        <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></template>
        Delete
      </DropdownMenuItem>
    </template>
  </ContextMenu>
</template>
