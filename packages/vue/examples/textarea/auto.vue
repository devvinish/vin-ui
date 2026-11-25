<script setup lang="ts">
import Textarea from "@/components/vin/textarea.vue";

</script>

<template>
  <Textarea label="Notes" :rows="2" auto-resize placeholder="Start typing…" hint="Grows as you type." style="width: 100%; max-width: 360px" />
</template>
