import { Collapsible } from "@/components/vin/collapsible";
import { Text } from "@/components/vin/typography";

export function CollapsibleBasic() {
  return (
    <Collapsible trigger="Order details" style={{ width: "100%", maxWidth: 360 }}>
      <Text variant="muted">2 items · Ships in 2 days · Free delivery</Text>
    </Collapsible>
  );
}
