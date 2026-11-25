<script lang="ts">
  import DataTable from "@/components/vin/data-table.svelte";

  const members = [
    { email: "asha@example.com", name: "Asha Rao", role: "Owner" },
    { email: "ben@example.com", name: "Ben Carter", role: "Admin" },
    { email: "chen@example.com", name: "Chen Wei", role: "Member" },
    { email: "divya@example.com", name: "Divya Nair", role: "Member" },
  ];
</script>

<DataTable
  label="Team members"
  data={members}
  rowKey="email"
  selectable
  selected={["chen@example.com", "divya@example.com"]}
  columns={[
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
  ]}
  style="max-width: 560px"
/>
