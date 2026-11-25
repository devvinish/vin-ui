import { Textarea } from "@/components/vin/textarea";

export function TextareaBasic() {
  return <Textarea label="Message" rows={3} placeholder="How can we help?" hint="We usually reply within a day." style={{ width: "100%", maxWidth: 360 }} />;
}
