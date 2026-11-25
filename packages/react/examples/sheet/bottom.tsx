import { Sheet } from "@/components/vin/sheet";
import { Button } from "@/components/vin/button";
import { Field } from "@/components/vin/input";

export function SheetBottom() {
  return (
    <Sheet side="bottom" trigger={<Button variant="outline">Share</Button>} title="Share this page" description="Anyone with the link can view it.">
      <Field label="Link" defaultValue="https://vinish.dev/ui" readOnly />
    </Sheet>
  );
}
