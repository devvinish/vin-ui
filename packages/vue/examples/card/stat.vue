<script setup lang="ts">
import Card, { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/vin/card.vue";
import Badge from "@/components/vin/badge.vue";

</script>

<template>
  <Card style="width: 100%; max-width: 280px">
    <CardHeader>
      <CardDescription>Monthly visitors</CardDescription>
      <CardTitle style="font-size: 28px">48,210</CardTitle>
    </CardHeader>
    <CardFooter>
      <Badge variant="success">+12.5%</Badge>
      <CardDescription>vs last month</CardDescription>
    </CardFooter>
  </Card>
</template>
