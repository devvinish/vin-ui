<script setup lang="ts">
import Tooltip from "@/components/vin/tooltip.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Tooltip content="On top" side="top"><Button variant="outline" size="sm">Top</Button></Tooltip>
  <Tooltip content="On the right" side="right"><Button variant="outline" size="sm">Right</Button></Tooltip>
  <Tooltip content="Below" side="bottom"><Button variant="outline" size="sm">Bottom</Button></Tooltip>
  <Tooltip content="On the left" side="left"><Button variant="outline" size="sm">Left</Button></Tooltip>
</template>
