import { Calendar } from "@/components/vin/calendar";

export function CalendarBasic() {
  return <Calendar defaultValue="2026-11-14" onValueChange={(date) => console.log(date)} />;
}
