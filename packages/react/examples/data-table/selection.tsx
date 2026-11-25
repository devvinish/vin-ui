import { DataTable } from "@/components/vin/data-table";

const members = [
  { email: "asha@example.com", name: "Asha Rao", role: "Owner" },
  { email: "ben@example.com", name: "Ben Carter", role: "Admin" },
  { email: "chen@example.com", name: "Chen Wei", role: "Member" },
  { email: "divya@example.com", name: "Divya Nair", role: "Member" },
];

export function DataTableSelection() {
  return (
    <DataTable
      label="Team members"
      data={members}
      rowKey="email"
      selectable
      defaultSelected={["chen@example.com", "divya@example.com"]}
      columns={[
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "role", header: "Role" },
      ]}
      style={{ maxWidth: 560 }}
    />
  );
}
