import { Checkbox } from "@/components/vin/checkbox";

export function CheckboxGroup() {
  return (
    <fieldset style={{ display: "grid", gap: 10, margin: 0, padding: 0, border: 0, minWidth: 0 }}>
      <legend className="vin-label" style={{ padding: 0, marginBottom: 10 }}>Notify me about</legend>
      <Checkbox label="Comments" defaultChecked />
      <Checkbox label="Mentions" defaultChecked />
      <Checkbox label="New releases" />
      <Checkbox label="Billing (always on)" defaultChecked disabled />
    </fieldset>
  );
}
