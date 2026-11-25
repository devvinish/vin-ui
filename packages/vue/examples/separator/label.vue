<script setup lang="ts">
import Button from "@/components/vin/button.vue";
import Separator from "@/components/vin/separator.vue";
import Field from "@/components/vin/input.vue";

</script>

<template>
  <div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
    <Button variant="outline">Continue with GitHub</Button>
    <Separator label="or" />
    <Field label="Email" type="email" placeholder="you@example.com" />
    <Button>Continue with email</Button>
  </div>
</template>
