import { Switch } from "@/components/vin/switch";

export function SwitchBasic() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Switch label="Wi-Fi" defaultChecked />
      <Switch label="Bluetooth" />
    </div>
  );
}
