<script setup lang="ts">
import Pagination from "@/components/vin/pagination.vue";

</script>

<template>
  <Pagination :page="2" :count="10" simple :href="(p: number) => `?page=${p}`" />
</template>
