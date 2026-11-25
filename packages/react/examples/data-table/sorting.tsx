import { DataTable } from "@/components/vin/data-table";

const people = [
  { name: "Meera Shah", role: "Design", commits: 184, joined: "2023-04-11" },
  { name: "Tom Okafor", role: "Engineering", commits: 1290, joined: "2021-09-02" },
  { name: "Sara Lind", role: "Engineering", commits: 642, joined: "2022-01-17" },
  { name: "Ravi Menon", role: "Docs", commits: 97, joined: "2024-06-30" },
  { name: "Lucía Ortiz", role: "Product", commits: 215, joined: "2022-11-05" },
];

export function DataTableSorting() {
  return (
    <DataTable
      label="Contributors"
      data={people}
      rowKey="name"
      defaultSort={{ key: "commits", direction: "descending" }}
      columns={[
        { key: "name", header: "Name" },
        { key: "role", header: "Role" },
        { key: "joined", header: "Joined" },
        { key: "commits", header: "Commits", numeric: true, cell: (r) => r.commits.toLocaleString("en-US") },
      ]}
      style={{ maxWidth: 560 }}
    />
  );
}
