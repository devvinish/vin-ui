import { DatePicker } from "@/components/vin/date-picker";

export function DatePickerBasic() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 280 }}>
      <DatePicker label="Due date" defaultValue="2026-11-14" name="due" />
    </div>
  );
}
