import { Button } from "@/components/vin/button";
import { Field } from "@/components/vin/input";
import { Separator } from "@/components/vin/separator";

export function SeparatorLabel() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <Button variant="outline">Continue with GitHub</Button>
      <Separator label="or" />
      <Field label="Email" type="email" placeholder="you@example.com" />
      <Button>Continue with email</Button>
    </div>
  );
}
