import { ButtonGroup } from "@/components/vin/button-group";
import { Button } from "@/components/vin/button";

export function ButtonGroupVertical() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Align">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  );
}
