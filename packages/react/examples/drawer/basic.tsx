import { Drawer, DrawerClose } from "@/components/vin/drawer";
import { Button } from "@/components/vin/button";
import { Field } from "@/components/vin/input";

export function DrawerBasic() {
  return (
    <Drawer
      trigger={<Button variant="outline">Set daily goal</Button>}
      title="Daily goal"
      description="How many minutes do you want to practise each day?"
      footer={
        <>
          <DrawerClose><Button variant="outline">Cancel</Button></DrawerClose>
          <DrawerClose><Button>Save goal</Button></DrawerClose>
        </>
      }
    >
      <Field label="Minutes a day" type="number" inputMode="numeric" min={5} max={240} step={5} defaultValue={30} />
    </Drawer>
  );
}
