import { Textarea } from "@/components/vin/textarea";

export function TextareaCount() {
  return (
    <Textarea
      label="Bio"
      rows={3}
      maxLength={160}
      defaultValue="Designer and developer in Delhi."
      hint="Shown on your profile."
      style={{ width: "100%", maxWidth: 360 }}
    />
  );
}
