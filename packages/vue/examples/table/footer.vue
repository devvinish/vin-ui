<script setup lang="ts">
import Table from "@/components/vin/table.vue";


const rows = [["Team plan", 5, "₹4,995"], ["Extra storage", 2, "₹598"], ["Priority support", 1, "₹1,499"]] as const;
</script>

<template>
  <Table label="Order summary" style="max-width: 480px">
    <thead>
      <tr><th scope="col">Item</th><th scope="col" class="vin-table__num">Qty</th><th scope="col" class="vin-table__num">Price</th></tr>
    </thead>
    <tbody>
      <tr v-for="[item, qty, price] in rows" :key="item">
        <td>{{ item }}</td><td class="vin-table__num">{{ qty }}</td><td class="vin-table__num">{{ price }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr><th scope="row" colspan="2">Total</th><td class="vin-table__num">₹7,092</td></tr>
    </tfoot>
  </Table>
</template>
