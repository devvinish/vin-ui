import { Switch } from "@/components/vin/switch";

export function SwitchSettings() {
  return (
    <div style={{ display: "grid", gap: 18, width: "100%", maxWidth: 380 }}>
      <Switch label="Marketing emails" description="News, offers and product updates." controlPosition="end" />
      <Switch label="Security alerts" description="Sign-ins from new devices." controlPosition="end" defaultChecked />
    </div>
  );
}
