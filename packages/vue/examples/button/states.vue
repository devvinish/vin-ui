<script setup lang="ts">
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Button>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
    Download
  </Button>
  <Button variant="outline">
    Next
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </Button>
  <Button disabled>Disabled</Button>
  <Button variant="secondary" href="#states">As a link</Button>
</template>
