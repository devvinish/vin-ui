<script setup lang="ts">
import Sheet from "@/components/vin/sheet.vue";
import Button from "@/components/vin/button.vue";
import { Link } from "@/components/vin/typography.vue";

</script>

<template>
  <Sheet side="left" title="VinUI">
    <template #trigger><Button variant="outline">Menu</Button></template>
    <nav aria-label="Main" style="display: grid; gap: 12px">
      <Link href="#docs">Docs</Link>
      <Link href="#components">Components</Link>
      <Link href="#styles">Styles</Link>
      <Link href="#changelog">Changelog</Link>
    </nav>
  </Sheet>
</template>
