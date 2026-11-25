<script setup lang="ts">
import Card, { CardHeader, CardTitle, CardDescription, CardBody } from "@/components/vin/card.vue";
import Separator from "@/components/vin/separator.vue";

</script>

<template>
  <Card style="width: 100%; max-width: 340px">
    <CardHeader>
      <CardTitle>VinUI</CardTitle>
      <CardDescription>Components in eight styles.</CardDescription>
    </CardHeader>
    <Separator />
    <CardBody>
      <p>Copy the HTML or the React version. Both read the same theme.</p>
    </CardBody>
  </Card>
</template>
