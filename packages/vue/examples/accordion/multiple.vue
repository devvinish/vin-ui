<script setup lang="ts">
import Accordion from "@/components/vin/accordion.vue";


const items = [
  { value: "shipping", title: "Shipping", content: "Orders leave our warehouse within two working days." },
  { value: "returns", title: "Returns", content: "Send it back within 30 days for a full refund." },
  { value: "warranty", title: "Warranty", content: "Two years on every product, parts and labour." },
];
</script>

<template>
  <Accordion type="multiple" :items="items" :default-value="['shipping', 'returns']" style="max-width: 480px" />
</template>
