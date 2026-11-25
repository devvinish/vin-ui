<script setup lang="ts">
import Breadcrumb from "@/components/vin/breadcrumb.vue";

</script>

<template>
  <Breadcrumb separator="chevron" :items="[{ label: 'Docs', href: '#' }, { label: 'Getting started', href: '#' }, { label: 'Installation' }]" />
</template>
