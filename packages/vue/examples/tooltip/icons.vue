<script setup lang="ts">
import Tooltip from "@/components/vin/tooltip.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <div style="display: flex; gap: 4px">
    <Tooltip content="Align left" label>
      <Button variant="ghost" size="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h14" /></svg></Button>
    </Tooltip>
    <Tooltip content="Align centre" label>
      <Button variant="ghost" size="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10M5 18h14" /></svg></Button>
    </Tooltip>
    <Tooltip content="Align right" label>
      <Button variant="ghost" size="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M10 12h10M6 18h14" /></svg></Button>
    </Tooltip>
  </div>
</template>
