import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from "@/components/vin/card";
import { Field } from "@/components/vin/input";
import { Button } from "@/components/vin/button";

export function CardForm() {
  return (
    <Card style={{ width: "100%", maxWidth: 360 }}>
      <CardHeader>
        <CardTitle>New project</CardTitle>
        <CardDescription>You can change these later.</CardDescription>
      </CardHeader>
      <CardBody>
        <Field label="Project name" placeholder="My app" />
      </CardBody>
      <CardFooter>
        <Button>Create</Button>
        <Button variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
