import { Popover } from "@/components/vin/popover";
import { Button } from "@/components/vin/button";
import { Field } from "@/components/vin/input";

export function PopoverForm() {
  return (
    <Popover trigger={<Button variant="outline">Dimensions</Button>} title="Dimensions" description="Set the size of the layer." style={{ width: 260 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Width" size="sm" defaultValue="1200" />
        <Field label="Height" size="sm" defaultValue="800" />
      </div>
    </Popover>
  );
}
