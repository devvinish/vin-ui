<script setup lang="ts">
import Spinner from "@/components/vin/spinner.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Button disabled>
    <Spinner size="sm" decorative />
    Saving…
  </Button>
  <Button variant="outline" disabled>
    <Spinner size="sm" decorative />
    Loading more
  </Button>
</template>
