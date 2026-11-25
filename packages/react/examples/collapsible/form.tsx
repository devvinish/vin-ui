import { Collapsible } from "@/components/vin/collapsible";
import { Field } from "@/components/vin/input";
import { Checkbox } from "@/components/vin/checkbox";

export function CollapsibleForm() {
  return (
    <Collapsible trigger="Advanced settings" defaultOpen style={{ width: "100%", maxWidth: 360 }} contentProps={{ style: { display: "grid", gap: 12 } }}>
      <Field label="Timeout (seconds)" type="number" defaultValue="30" />
      <Checkbox label="Retry failed requests" defaultChecked />
    </Collapsible>
  );
}
