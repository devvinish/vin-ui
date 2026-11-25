import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "@/components/vin/card";
import { Collapsible } from "@/components/vin/collapsible";
import { Text } from "@/components/vin/typography";

export function CollapsibleCard() {
  return (
    <Card style={{ width: "100%", maxWidth: 360 }}>
      <CardHeader>
        <CardTitle>Who has access</CardTitle>
        <CardDescription>Ada Lovelace and 3 others.</CardDescription>
      </CardHeader>
      <CardBody>
        <Collapsible trigger="Show everyone">
          <Text variant="muted">Alan Turing, Grace Hopper, Katherine Johnson</Text>
        </Collapsible>
      </CardBody>
    </Card>
  );
}
