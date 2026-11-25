<script setup lang="ts">
import Item, { ItemGroup } from "@/components/vin/item.vue";
import Badge from "@/components/vin/badge.vue";

</script>

<template>
  <ItemGroup style="max-width: 420px">
    <Item title="Brand guidelines.pdf" description="2.4 MB · Edited today">
      <template #media><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg></template>
      <template #actions><Badge variant="success">Shared</Badge></template>
    </Item>
    <Item title="Hero image.png" description="840 KB · Edited yesterday">
      <template #media><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg></template>
      <template #actions><Badge>Draft</Badge></template>
    </Item>
    <Item title="Release notes.md" description="12 KB · Edited 3 days ago">
      <template #media><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></svg></template>
      <template #actions><Badge>Draft</Badge></template>
    </Item>
  </ItemGroup>
</template>
