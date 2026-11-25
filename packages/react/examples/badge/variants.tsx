import { Badge } from "@/components/vin/badge";

export function BadgeVariants() {
  return (
    <>
      <Badge>Draft</Badge>
      <Badge variant="primary">New</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Failed</Badge>
      <Badge variant="outline">v0.1.0</Badge>
    </>
  );
}
