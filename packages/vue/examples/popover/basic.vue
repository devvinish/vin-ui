<script setup lang="ts">
import Popover from "@/components/vin/popover.vue";
import Button from "@/components/vin/button.vue";
import { Link } from "@/components/vin/typography.vue";

</script>

<template>
  <Popover title="Team plan">
    <template #trigger><Button variant="outline">About this plan</Button></template>
    <template #description>Up to 10 people share one theme and one set of components. <Link href="#">Compare plans</Link></template>
  </Popover>
</template>
