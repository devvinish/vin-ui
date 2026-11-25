<script setup lang="ts">
import InputGroup from "@/components/vin/input-group.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
    <InputGroup label="API key" default-value="vin_live_8f2k…" readonly>
      <template #end>
        <Button variant="ghost" size="icon" aria-label="Copy API key">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        </Button>
      </template>
    </InputGroup>
    <InputGroup type="email" placeholder="you@example.com" aria-label="Email for newsletter">
      <template #end><Button>Subscribe</Button></template>
    </InputGroup>
  </div>
</template>
