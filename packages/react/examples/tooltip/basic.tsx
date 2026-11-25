import { Tooltip } from "@/components/vin/tooltip";
import { Button } from "@/components/vin/button";

export function TooltipBasic() {
  return (
    <Tooltip content="Add to your library">
      <Button variant="outline">Save</Button>
    </Tooltip>
  );
}
