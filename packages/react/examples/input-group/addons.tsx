import { InputGroup } from "@/components/vin/input-group";

export function InputGroupAddons() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <InputGroup label="Website" start="https://" placeholder="example.com" />
      <InputGroup label="Price (INR)" start="₹" end="per month" inputMode="decimal" defaultValue="1,499" />
    </div>
  );
}
