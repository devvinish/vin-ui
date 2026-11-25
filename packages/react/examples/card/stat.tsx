import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/vin/card";
import { Badge } from "@/components/vin/badge";

export function CardStat() {
  return (
    <Card style={{ width: "100%", maxWidth: 280 }}>
      <CardHeader>
        <CardDescription>Monthly visitors</CardDescription>
        <CardTitle style={{ fontSize: 28 }}>48,210</CardTitle>
      </CardHeader>
      <CardFooter>
        <Badge variant="success">+12.5%</Badge>
        <CardDescription>vs last month</CardDescription>
      </CardFooter>
    </Card>
  );
}
