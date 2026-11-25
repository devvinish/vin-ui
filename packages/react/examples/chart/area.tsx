import { Chart } from "@/components/vin/chart";

const revenue = [
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 15100 },
  { month: "Mar", revenue: 14200 },
  { month: "Apr", revenue: 18900 },
  { month: "May", revenue: 22300 },
  { month: "Jun", revenue: 21000 },
  { month: "Jul", revenue: 26400 },
  { month: "Aug", revenue: 29800 },
];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const short = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 0 });

export function ChartArea() {
  return (
    <Chart
      type="area"
      label="Revenue by month, January to August"
      data={revenue}
      index="month"
      indexLabel="Month"
      series={[{ key: "revenue", label: "Revenue" }]}
      format={(v) => inr.format(v)}
      tickFormat={(v) => short.format(v)}
      style={{ maxWidth: 560 }}
    />
  );
}
