import { Field } from "@/components/vin/input";

export function InputBasic() {
  return <Field label="Email" type="email" placeholder="you@example.com" hint="We'll never share it." style={{ width: "100%", maxWidth: 320 }} />;
}
