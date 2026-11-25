import { Switch } from "@/components/vin/switch";

export function SwitchSizes() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Switch label="Compact view" size="sm" defaultChecked />
      <Switch label="Beta features (managed)" defaultChecked disabled />
      <Switch label="Offline sync" disabled />
    </div>
  );
}
