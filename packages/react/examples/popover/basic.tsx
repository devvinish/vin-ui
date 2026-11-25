import { Popover } from "@/components/vin/popover";
import { Button } from "@/components/vin/button";
import { Link } from "@/components/vin/typography";

export function PopoverBasic() {
  return (
    <Popover
      trigger={<Button variant="outline">About this plan</Button>}
      title="Team plan"
      description={<>Up to 10 people share one theme and one set of components. <Link href="#">Compare plans</Link></>}
    />
  );
}
