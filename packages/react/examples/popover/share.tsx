import { Popover } from "@/components/vin/popover";
import { Button } from "@/components/vin/button";
import { InputGroup } from "@/components/vin/input-group";

export function PopoverShare() {
  return (
    <Popover trigger={<Button>Share</Button>} title="Share this page" description="Anyone with the link can view it." align="end" style={{ width: 300 }}>
      <InputGroup aria-label="Link" defaultValue="https://vinish.dev/ui/s/8f2k" readOnly end={<Button variant="ghost" size="sm">Copy</Button>} />
    </Popover>
  );
}
