<script setup lang="ts">
import Button from "@/components/vin/button.vue";
import ButtonGroup from "@/components/vin/button-group.vue";

</script>

<template>
  <ButtonGroup aria-label="Message actions">
    <Button variant="outline">Archive</Button>
    <Button variant="outline">Report</Button>
    <Button variant="outline">Snooze</Button>
  </ButtonGroup>
  <ButtonGroup aria-label="History">
    <Button variant="secondary">Undo</Button>
    <Button variant="secondary">Redo</Button>
  </ButtonGroup>
</template>
