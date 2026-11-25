<script setup lang="ts">
import Drawer, { DrawerClose } from "@/components/vin/drawer.vue";
import Button from "@/components/vin/button.vue";
</script>

<template>
  <Drawer title="Sunset over the bay.jpg">
    <template #trigger><Button variant="outline">Photo options</Button></template>
    <DrawerClose>
      <Button variant="ghost">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></svg>
        Save to device
      </Button>
    </DrawerClose>
    <DrawerClose>
      <Button variant="ghost">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
        Copy link
      </Button>
    </DrawerClose>
    <DrawerClose>
      <Button variant="ghost">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
        Report a problem
      </Button>
    </DrawerClose>
  </Drawer>
</template>
