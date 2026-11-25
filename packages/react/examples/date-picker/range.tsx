import { DatePicker } from "@/components/vin/date-picker";

export function DatePickerRange() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 280 }}>
      <DatePicker mode="range" label="Trip dates" defaultValue={{ from: "2026-11-09", to: "2026-11-15" }} name="trip" />
    </div>
  );
}
