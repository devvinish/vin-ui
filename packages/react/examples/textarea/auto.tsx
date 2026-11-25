import { Textarea } from "@/components/vin/textarea";

export function TextareaAuto() {
  return <Textarea label="Notes" rows={2} autoResize placeholder="Start typing…" hint="Grows as you type." style={{ width: "100%", maxWidth: 360 }} />;
}
