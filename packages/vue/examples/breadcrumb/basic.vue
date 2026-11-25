<script setup lang="ts">
import Breadcrumb from "@/components/vin/breadcrumb.vue";

</script>

<template>
  <Breadcrumb :items="[{ label: 'Home', href: '#' }, { label: 'Components', href: '#' }, { label: 'Breadcrumb' }]" />
</template>
