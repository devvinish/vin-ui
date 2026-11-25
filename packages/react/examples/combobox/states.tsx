import { Combobox } from "@/components/vin/combobox";

const countries = [
  { value: "au", label: "Australia" },
  { value: "ca", label: "Canada" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan", disabled: true },
  { value: "gb", label: "United Kingdom" },
];

export function ComboboxStates() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <Combobox label="Country" options={countries} placeholder="Search countries…" error="Choose your country." />
      <Combobox label="Language" options={[{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }]} defaultValue="en" disabled />
    </div>
  );
}
