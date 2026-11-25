<script setup lang="ts">
import { Loading } from "@/components/vin/spinner.vue";
import Card, { CardBody } from "@/components/vin/card.vue";

</script>

<template>
  <div style="display: grid; gap: 20px; justify-items: center; width: 100%; max-width: 300px">
    <Loading>Loading results…</Loading>
    <Card style="width: 100%">
      <CardBody style="display: grid; place-items: center; min-height: 120px">
        <Loading variant="primary">Fetching invoices…</Loading>
      </CardBody>
    </Card>
  </div>
</template>
