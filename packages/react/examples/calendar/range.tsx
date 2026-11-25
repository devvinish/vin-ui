import { Calendar } from "@/components/vin/calendar";

export function CalendarRange() {
  return <Calendar mode="range" defaultValue={{ from: "2026-11-09", to: "2026-11-15" }} onValueChange={(range) => console.log(range)} />;
}
