<script setup lang="ts">
import Sheet from "@/components/vin/sheet.vue";
import Button from "@/components/vin/button.vue";
import Field from "@/components/vin/input.vue";

</script>

<template>
  <Sheet side="bottom" title="Share this page" description="Anyone with the link can view it.">
    <template #trigger><Button variant="outline">Share</Button></template>
    <Field label="Link" default-value="https://vinish.dev/ui" readonly />
  </Sheet>
</template>
