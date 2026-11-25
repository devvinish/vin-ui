import { Calendar } from "@/components/vin/calendar";

// Weekdays only, between two dates; the week starts on Sunday.
const weekend = (date: string) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());

export function CalendarLimits() {
  return <Calendar defaultValue="2026-11-18" weekStartsOn={0} min="2026-11-05" max="2026-12-20" isDateDisabled={weekend} />;
}
