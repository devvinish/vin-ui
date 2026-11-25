import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "@/components/vin/card";
import { Separator } from "@/components/vin/separator";

export function SeparatorHorizontal() {
  return (
    <Card style={{ width: "100%", maxWidth: 340 }}>
      <CardHeader>
        <CardTitle>VinUI</CardTitle>
        <CardDescription>Components in eight styles.</CardDescription>
      </CardHeader>
      <Separator />
      <CardBody>
        <p>Copy the HTML or the React version. Both read the same theme.</p>
      </CardBody>
    </Card>
  );
}
