<script setup lang="ts">
import Sheet, { SheetClose } from "@/components/vin/sheet.vue";
import Button from "@/components/vin/button.vue";
import Checkbox from "@/components/vin/checkbox.vue";
import Field from "@/components/vin/input.vue";


const onApply = (data: FormData) => console.log(Object.fromEntries(data));
</script>

<template>
  <Sheet title="Filters" description="Narrow the list of components." @submit="onApply">
    <template #trigger><Button variant="outline">Filters</Button></template>
    <Field label="Search" name="q" type="search" placeholder="Button, card…" />
    <Checkbox label="Forms" name="forms" default-checked />
    <Checkbox label="Overlays" name="overlays" />
    <template #footer>
      <SheetClose><Button variant="outline">Cancel</Button></SheetClose>
      <Button type="submit" value="apply">Show results</Button>
    </template>
  </Sheet>
</template>
