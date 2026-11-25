import { Field } from "@/components/vin/input";

export function InputStates() {
  const width = { width: "100%", maxWidth: 320 };
  return (
    <>
      <Field label="Username" defaultValue="vinish" error="That username is taken." style={width} />
      <Field label="Plan" defaultValue="Free" disabled style={width} />
      <Field label="Bio" multiline rows={3} placeholder="A few words about you" style={width} />
    </>
  );
}
