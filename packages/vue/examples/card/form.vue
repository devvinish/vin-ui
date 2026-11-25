<script setup lang="ts">
import Card, { CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from "@/components/vin/card.vue";
import Button from "@/components/vin/button.vue";
import Field from "@/components/vin/input.vue";

</script>

<template>
  <Card style="width: 100%; max-width: 360px">
    <CardHeader>
      <CardTitle>New project</CardTitle>
      <CardDescription>You can change these later.</CardDescription>
    </CardHeader>
    <CardBody>
      <Field label="Project name" placeholder="My app" />
    </CardBody>
    <CardFooter>
      <Button>Create</Button>
      <Button variant="outline">Cancel</Button>
    </CardFooter>
  </Card>
</template>
