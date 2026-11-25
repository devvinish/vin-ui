import { Input } from "@/components/vin/input";

export function InputSizes() {
  return (
    <div className="vin-field" style={{ width: "100%", maxWidth: 320 }}>
      <Input size="sm" aria-label="Small input" placeholder="Small" />
      <Input aria-label="Medium input" placeholder="Medium" />
      <Input size="lg" aria-label="Large input" placeholder="Large" />
    </div>
  );
}
