<script setup lang="ts">
import Popover from "@/components/vin/popover.vue";
import Button from "@/components/vin/button.vue";
import InputGroup from "@/components/vin/input-group.vue";

</script>

<template>
  <Popover title="Share this page" description="Anyone with the link can view it." align="end" style="width: 300px">
    <template #trigger><Button>Share</Button></template>
    <InputGroup aria-label="Link" default-value="https://vinish.dev/ui/s/8f2k" readonly>
      <template #end><Button variant="ghost" size="sm">Copy</Button></template>
    </InputGroup>
  </Popover>
</template>
