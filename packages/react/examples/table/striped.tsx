import { Table } from "@/components/vin/table";

const team = [["Ada", "Owner", 2023], ["Alan", "Admin", 2024], ["Grace", "Editor", 2024], ["Katherine", "Editor", 2025], ["Linus", "Viewer", 2026]] as const;

export function TableStriped() {
  return (
    <Table label="Team" striped style={{ maxWidth: 480 }}>
      <thead>
        <tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col" className="vin-table__num">Joined</th></tr>
      </thead>
      <tbody>
        {team.map(([name, role, year]) => (
          <tr key={name}><td>{name}</td><td>{role}</td><td className="vin-table__num">{year}</td></tr>
        ))}
      </tbody>
    </Table>
  );
}
