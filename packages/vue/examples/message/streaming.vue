<script setup lang="ts">
import Message from "@/components/vin/message.vue";
import Avatar from "@/components/vin/avatar.vue";
</script>

<template>
  <Message streaming style="max-width: 560px" author="Assistant" time="Writing…">
    <template #avatar><Avatar name="Assistant" size="sm" shape="square" fallback="AI" /></template>
    <p>Sure. Start by opening the settings page and choosing</p>
  </Message>
</template>
