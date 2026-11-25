<script setup lang="ts">
import ScrollArea from "@/components/vin/scroll-area.vue";
import Separator from "@/components/vin/separator.vue";

const releases = ["v2.4.0", "v2.3.1", "v2.3.0", "v2.2.0", "v2.1.2", "v2.1.1", "v2.1.0", "v2.0.0", "v1.9.0", "v1.8.0"];
</script>

<template>
  <ScrollArea label="Releases" style="width: 100%; max-width: 240px; height: 220px">
    <div style="padding: 12px 16px">
      <p style="margin: 0 0 8px; font-weight: 600">Releases</p>
      <template v-for="(r, i) in releases" :key="r">
        <Separator v-if="i > 0" />
        <div style="padding: 6px 0">{{ r }}</div>
      </template>
    </div>
  </ScrollArea>
</template>
