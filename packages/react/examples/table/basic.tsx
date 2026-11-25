import { Table } from "@/components/vin/table";
import { Badge } from "@/components/vin/badge";

const rows = [
  ["INV-1042", "success", "Paid", "₹12,400"],
  ["INV-1041", "warning", "Pending", "₹8,250"],
  ["INV-1040", "danger", "Overdue", "₹3,100"],
  ["INV-1039", "success", "Paid", "₹15,000"],
] as const;

export function TableBasic() {
  return (
    <Table caption="Recent invoices" style={{ maxWidth: 480 }}>
      <thead>
        <tr><th scope="col">Invoice</th><th scope="col">Status</th><th scope="col" className="vin-table__num">Amount</th></tr>
      </thead>
      <tbody>
        {rows.map(([id, variant, status, amount]) => (
          <tr key={id}><td>{id}</td><td><Badge variant={variant}>{status}</Badge></td><td className="vin-table__num">{amount}</td></tr>
        ))}
      </tbody>
    </Table>
  );
}
