<script setup lang="ts">
import Table from "@/components/vin/table.vue";


const team = [["Ada", "Owner", 2023], ["Alan", "Admin", 2024], ["Grace", "Editor", 2024], ["Katherine", "Editor", 2025], ["Linus", "Viewer", 2026]] as const;
</script>

<template>
  <Table label="Team" striped style="max-width: 480px">
    <thead>
      <tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col" class="vin-table__num">Joined</th></tr>
    </thead>
    <tbody>
      <tr v-for="[name, role, year] in team" :key="name">
        <td>{{ name }}</td><td>{{ role }}</td><td class="vin-table__num">{{ year }}</td>
      </tr>
    </tbody>
  </Table>
</template>
