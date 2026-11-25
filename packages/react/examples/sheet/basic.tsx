import { Sheet, SheetClose } from "@/components/vin/sheet";
import { Button } from "@/components/vin/button";
import { Field } from "@/components/vin/input";
import { Checkbox } from "@/components/vin/checkbox";

export function SheetBasic() {
  return (
    <Sheet
      trigger={<Button variant="outline">Filters</Button>}
      title="Filters"
      description="Narrow the list of components."
      onSubmit={(data) => console.log(Object.fromEntries(data))}
      footer={
        <>
          <SheetClose><Button variant="outline">Cancel</Button></SheetClose>
          <Button type="submit" value="apply">Show results</Button>
        </>
      }
    >
      <Field label="Search" name="q" type="search" placeholder="Button, card…" />
      <Checkbox label="Forms" name="forms" defaultChecked />
      <Checkbox label="Overlays" name="overlays" />
    </Sheet>
  );
}
