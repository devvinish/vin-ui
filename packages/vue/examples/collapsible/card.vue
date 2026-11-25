<script setup lang="ts">
import Card, { CardHeader, CardTitle, CardDescription, CardBody } from "@/components/vin/card.vue";
import Collapsible from "@/components/vin/collapsible.vue";
import { Text } from "@/components/vin/typography.vue";

</script>

<template>
  <Card style="width: 100%; max-width: 360px">
    <CardHeader>
      <CardTitle>Who has access</CardTitle>
      <CardDescription>Ada Lovelace and 3 others.</CardDescription>
    </CardHeader>
    <CardBody>
      <Collapsible trigger="Show everyone">
        <Text variant="muted">Alan Turing, Grace Hopper, Katherine Johnson</Text>
      </Collapsible>
    </CardBody>
  </Card>
</template>
