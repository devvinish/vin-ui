<script setup lang="ts">
import Pagination from "@/components/vin/pagination.vue";

</script>

<template>
  <Pagination :page="1" :count="3" labels :href="(p: number) => `?page=${p}`" />
</template>
