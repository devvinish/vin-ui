import { Field } from "@/components/vin/input";

export function InputStates() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <Field label="Username" defaultValue="vinish" error="That username is taken." />
      <Field label="Plan" defaultValue="Free" disabled />
      <Field label="Bio" multiline rows={3} placeholder="A few words about you" />
    </div>
  );
}
