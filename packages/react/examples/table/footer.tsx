import { Table } from "@/components/vin/table";

const rows = [["Team plan", 5, "₹4,995"], ["Extra storage", 2, "₹598"], ["Priority support", 1, "₹1,499"]] as const;

export function TableFooter() {
  return (
    <Table label="Order summary" style={{ maxWidth: 480 }}>
      <thead>
        <tr><th scope="col">Item</th><th scope="col" className="vin-table__num">Qty</th><th scope="col" className="vin-table__num">Price</th></tr>
      </thead>
      <tbody>
        {rows.map(([item, qty, price]) => (
          <tr key={item}><td>{item}</td><td className="vin-table__num">{qty}</td><td className="vin-table__num">{price}</td></tr>
        ))}
      </tbody>
      <tfoot>
        <tr><th scope="row" colSpan={2}>Total</th><td className="vin-table__num">₹7,092</td></tr>
      </tfoot>
    </Table>
  );
}
