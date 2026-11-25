<script setup lang="ts">
import { ref } from "vue";
import Attachment, { AttachmentList } from "@/components/vin/attachment.vue";

const files = ref([
  { name: "design-brief.pdf", type: "PDF", size: 2516582 },
  { name: "hero-mountains.png", type: "PNG", size: 860160, thumbnail: "/ui/media/mountains.svg" },
  { name: "lake.jpg", variant: "image" as const, thumbnail: "/ui/media/lake.svg" },
]);
const remove = (name: string) => { files.value = files.value.filter((f) => f.name !== name); };
</script>

<template>
  <AttachmentList label="Attached files" style="max-width: 560px">
    <Attachment v-for="f in files" :key="f.name" v-bind="f" @remove="remove(f.name)" />
  </AttachmentList>
</template>
