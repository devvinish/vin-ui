<script setup lang="ts">
import Card from "@/components/vin/card.vue";
import Empty from "@/components/vin/empty.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Card style="width: 100%; max-width: 420px">
    <Empty title="No results for “astro”" description="Check the spelling or try a shorter word.">
      <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></template>
      <template #actions><Button variant="ghost" size="sm">Clear search</Button></template>
    </Empty>
  </Card>
</template>
