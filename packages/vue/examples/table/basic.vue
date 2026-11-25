<script setup lang="ts">
import Table from "@/components/vin/table.vue";
import Badge from "@/components/vin/badge.vue";


const rows = [
  ["INV-1042", "success", "Paid", "₹12,400"],
  ["INV-1041", "warning", "Pending", "₹8,250"],
  ["INV-1040", "danger", "Overdue", "₹3,100"],
  ["INV-1039", "success", "Paid", "₹15,000"],
] as const;
</script>

<template>
  <Table caption="Recent invoices" style="max-width: 480px">
    <thead>
      <tr><th scope="col">Invoice</th><th scope="col">Status</th><th scope="col" class="vin-table__num">Amount</th></tr>
    </thead>
    <tbody>
      <tr v-for="[id, variant, status, amount] in rows" :key="id">
        <td>{{ id }}</td><td><Badge :variant="variant">{{ status }}</Badge></td><td class="vin-table__num">{{ amount }}</td>
      </tr>
    </tbody>
  </Table>
</template>
