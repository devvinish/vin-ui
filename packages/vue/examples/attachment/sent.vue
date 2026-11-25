<script setup lang="ts">
import Attachment, { AttachmentList } from "@/components/vin/attachment.vue";
</script>

<template>
  <AttachmentList label="Files in this message" style="max-width: 560px">
    <Attachment
      name="lake.jpg"
      variant="image"
      thumbnail="/ui/media/lake.svg"
      href="/ui/media/lake.svg"
      style="--vin-attachment-tile: 120px"
    />
    <Attachment name="report-2026.pdf" href="/files/report-2026.pdf" download meta="PDF · 1.1 MB · Download" />
  </AttachmentList>
</template>
