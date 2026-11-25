import { NativeSelect } from "@/components/vin/native-select";

export function NativeSelectStates() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <NativeSelect label="Role" error="Pick a role to continue." defaultValue="">
        <option value="">Choose a role</option>
        <option>Admin</option>
        <option>Editor</option>
      </NativeSelect>
      <NativeSelect label="Region" disabled><option>Mumbai</option></NativeSelect>
    </div>
  );
}
