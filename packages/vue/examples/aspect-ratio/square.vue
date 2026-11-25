<script setup lang="ts">
import AspectRatio from "@/components/vin/aspect-ratio.vue";

</script>

<template>
  <AspectRatio :ratio="1" style="width: 160px">
    <img src="/ui/media/lake.svg" alt="A lake below green hills" />
  </AspectRatio>
  <AspectRatio :ratio="1" style="width: 160px">
    <img src="/ui/media/mountains.svg" alt="Purple mountains at sunset" />
  </AspectRatio>
</template>
