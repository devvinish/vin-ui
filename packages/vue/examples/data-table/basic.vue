<script setup lang="ts">
import DataTable, { type DataTableColumn } from "@/components/vin/data-table.vue";
import Badge from "@/components/vin/badge.vue";

type Invoice = { id: string; customer: string; status: "Paid" | "Pending" | "Overdue"; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1042", customer: "Asha Rao", status: "Paid", amount: 12400 },
  { id: "INV-1041", customer: "Ben Carter", status: "Pending", amount: 8250 },
  { id: "INV-1040", customer: "Chen Wei", status: "Overdue", amount: 3100 },
  { id: "INV-1039", customer: "Divya Nair", status: "Paid", amount: 15000 },
  { id: "INV-1038", customer: "Elena Petrova", status: "Paid", amount: 4720 },
  { id: "INV-1037", customer: "Farid Haddad", status: "Pending", amount: 9900 },
  { id: "INV-1036", customer: "Grace Kim", status: "Paid", amount: 2350 },
  { id: "INV-1035", customer: "Hiro Tanaka", status: "Overdue", amount: 6480 },
  { id: "INV-1034", customer: "Isla Murphy", status: "Paid", amount: 18200 },
  { id: "INV-1033", customer: "Jonas Weber", status: "Pending", amount: 5600 },
  { id: "INV-1032", customer: "Kavya Iyer", status: "Paid", amount: 7300 },
  { id: "INV-1031", customer: "Liam Byrne", status: "Paid", amount: 11050 },
];

const tone = { Paid: "success", Pending: "warning", Overdue: "danger" } as const;
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const columns: DataTableColumn<Invoice>[] = [
  { key: "id", header: "Invoice" },
  { key: "customer", header: "Customer" },
  { key: "status", header: "Status", sortable: false },
  { key: "amount", header: "Amount", numeric: true, cell: (r) => inr(r.amount), filterValue: (r) => inr(r.amount) },
];
</script>

<template>
  <DataTable
    label="Invoices"
    :data="invoices"
    row-key="id"
    selectable
    filterable
    filter-placeholder="Filter invoices…"
    :page-size="5"
    :columns="columns"
    style="max-width: 720px"
  >
    <template #cell-status="{ row }"><Badge :variant="tone[row.status]">{{ row.status }}</Badge></template>
  </DataTable>
</template>
