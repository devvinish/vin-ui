import { Select } from "@/components/vin/select";

const zones = [
  { value: "ist", label: "India (IST)" },
  { value: "gmt", label: "London (GMT)" },
  { value: "pst", label: "Los Angeles (PST)", disabled: true },
  { value: "jst", label: "Tokyo (JST)" },
];

export function SelectStates() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <Select label="Time zone" options={zones} placeholder="Choose a time zone" error="Choose a time zone." />
      <Select label="Currency" options={["INR", "USD"]} defaultValue="INR" disabled />
    </div>
  );
}
