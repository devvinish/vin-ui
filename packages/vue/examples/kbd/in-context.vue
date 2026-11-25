<script setup lang="ts">
import Kbd, { KbdGroup } from "@/components/vin/kbd.vue";
import Button from "@/components/vin/button.vue";
import InputGroup from "@/components/vin/input-group.vue";

</script>

<template>
  <Button variant="secondary">
    Save
    <KbdGroup><Kbd>⌘</Kbd><Kbd>S</Kbd></KbdGroup>
  </Button>
  <Button>
    Run
    <Kbd>↵</Kbd>
  </Button>
  <InputGroup style="width: 100%; max-width: 280px" type="search" placeholder="Search" aria-label="Search">
    <template #start><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></template>
    <template #end><KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup></template>
  </InputGroup>
</template>
