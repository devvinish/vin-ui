<script setup lang="ts">
import Checkbox from "@/components/vin/checkbox.vue";
import Collapsible from "@/components/vin/collapsible.vue";
import Field from "@/components/vin/input.vue";

</script>

<template>
  <Collapsible trigger="Advanced settings" default-open style="width: 100%; max-width: 360px" :content-props="{ style: { display: 'grid', gap: '12px' } }">
    <Field label="Timeout (seconds)" type="number" default-value="30" />
    <Checkbox label="Retry failed requests" default-checked />
  </Collapsible>
</template>
