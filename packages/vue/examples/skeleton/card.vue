<script setup lang="ts">
import Card, { CardBody } from "@/components/vin/card.vue";
import Skeleton from "@/components/vin/skeleton.vue";

</script>

<template>
  <Card role="status" aria-label="Loading article" style="width: 100%; max-width: 300px; overflow: hidden">
    <Skeleton style="height: 140px; border-radius: 0" />
    <CardBody style="display: grid; gap: 10px">
      <Skeleton style="height: 18px; width: 65%" />
      <Skeleton shape="text" />
      <Skeleton shape="text" style="width: 85%" />
      <Skeleton style="height: 36px; width: 110px; margin-top: 6px" />
    </CardBody>
  </Card>
</template>
