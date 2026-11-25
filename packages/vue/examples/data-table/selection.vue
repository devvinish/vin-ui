<script setup lang="ts">
import DataTable from "@/components/vin/data-table.vue";

const members = [
  { email: "asha@example.com", name: "Asha Rao", role: "Owner" },
  { email: "ben@example.com", name: "Ben Carter", role: "Admin" },
  { email: "chen@example.com", name: "Chen Wei", role: "Member" },
  { email: "divya@example.com", name: "Divya Nair", role: "Member" },
];
const columns = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
];
</script>

<template>
  <DataTable
    label="Team members"
    :data="members"
    row-key="email"
    selectable
    :default-selected="['chen@example.com', 'divya@example.com']"
    :columns="columns"
    style="max-width: 560px"
  />
</template>
