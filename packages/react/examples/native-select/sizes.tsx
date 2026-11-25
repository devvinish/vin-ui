import { NativeSelect } from "@/components/vin/native-select";

export function NativeSelectSizes() {
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 240 }}>
      <NativeSelect size="sm" aria-label="Small"><option>Small</option><option>Medium</option></NativeSelect>
      <NativeSelect aria-label="Medium"><option>Medium</option><option>Small</option></NativeSelect>
      <NativeSelect size="lg" aria-label="Large"><option>Large</option><option>Medium</option></NativeSelect>
    </div>
  );
}
