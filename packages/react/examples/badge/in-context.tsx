import { Badge } from "@/components/vin/badge";
import { Button } from "@/components/vin/button";

export function BadgeInContext() {
  return (
    <>
      <Button variant="secondary">
        Inbox
        <Badge variant="primary">12</Badge>
      </Button>
      <Button variant="outline">
        Releases
        <Badge variant="success">New</Badge>
      </Button>
    </>
  );
}
