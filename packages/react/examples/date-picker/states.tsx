import { DatePicker } from "@/components/vin/date-picker";

export function DatePickerStates() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 280 }}>
      <DatePicker label="Start date" error="Choose a start date." />
      <DatePicker label="End date" defaultValue="2026-12-31" disabled />
    </div>
  );
}
