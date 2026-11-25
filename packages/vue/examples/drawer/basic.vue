<script setup lang="ts">
import Drawer, { DrawerClose } from "@/components/vin/drawer.vue";
import Button from "@/components/vin/button.vue";
import Field from "@/components/vin/input.vue";
</script>

<template>
  <Drawer title="Daily goal" description="How many minutes do you want to practise each day?">
    <template #trigger><Button variant="outline">Set daily goal</Button></template>
    <Field label="Minutes a day" type="number" inputmode="numeric" :min="5" :max="240" :step="5" default-value="30" />
    <template #footer>
      <DrawerClose><Button variant="outline">Cancel</Button></DrawerClose>
      <DrawerClose><Button>Save goal</Button></DrawerClose>
    </template>
  </Drawer>
</template>
