<script lang="ts">
  import Table from "@/components/vin/table.svelte";
  import Badge from "@/components/vin/badge.svelte";

  const rows = [
    ["INV-1042", "success", "Paid", "₹12,400"],
    ["INV-1041", "warning", "Pending", "₹8,250"],
    ["INV-1040", "danger", "Overdue", "₹3,100"],
    ["INV-1039", "success", "Paid", "₹15,000"],
  ] as const;
</script>

<Table caption="Recent invoices" style="max-width: 480px">
  <thead>
    <tr><th scope="col">Invoice</th><th scope="col">Status</th><th scope="col" class="vin-table__num">Amount</th></tr>
  </thead>
  <tbody>
    {#each rows as [id, variant, status, amount] (id)}
      <tr><td>{id}</td><td><Badge {variant}>{status}</Badge></td><td class="vin-table__num">{amount}</td></tr>
    {/each}
  </tbody>
</Table>
