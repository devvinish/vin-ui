import { ButtonGroup } from "@/components/vin/button-group";
import { Button } from "@/components/vin/button";

export function ButtonGroupSplit() {
  return (
    <ButtonGroup aria-label="Save">
      <Button>Save changes</Button>
      <Button size="icon" aria-label="More save options">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </Button>
    </ButtonGroup>
  );
}
