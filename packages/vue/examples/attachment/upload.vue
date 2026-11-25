<script setup lang="ts">
import Attachment, { AttachmentList } from "@/components/vin/attachment.vue";

const cancel = () => {};
const retry = () => {};
</script>

<template>
  <AttachmentList label="Uploads" style="max-width: 560px">
    <Attachment name="sales-q3.csv" :progress="64" @remove="cancel" />
    <Attachment name="recording.mov" error="Upload failed" @retry="retry" @remove="cancel" />
  </AttachmentList>
</template>
