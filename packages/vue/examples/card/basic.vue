<script setup lang="ts">
import Card, { CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from "@/components/vin/card.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <Card style="width: 100%; max-width: 360px">
    <CardHeader>
      <CardTitle>Team plan</CardTitle>
      <CardDescription>Everything in Free, plus shared workspaces.</CardDescription>
    </CardHeader>
    <CardBody>
      <p>Invite up to 10 people, share components and keep one theme for the whole team.</p>
    </CardBody>
    <CardFooter>
      <Button>Upgrade</Button>
      <Button variant="ghost">Compare plans</Button>
    </CardFooter>
  </Card>
</template>
