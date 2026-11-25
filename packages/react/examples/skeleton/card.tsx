import { Card, CardBody } from "@/components/vin/card";
import { Skeleton } from "@/components/vin/skeleton";

export function SkeletonCard() {
  return (
    <Card role="status" aria-label="Loading article" style={{ width: "100%", maxWidth: 300, overflow: "hidden" }}>
      <Skeleton style={{ height: 140, borderRadius: 0 }} />
      <CardBody style={{ display: "grid", gap: 10 }}>
        <Skeleton style={{ height: 18, width: "65%" }} />
        <Skeleton shape="text" />
        <Skeleton shape="text" style={{ width: "85%" }} />
        <Skeleton style={{ height: 36, width: 110, marginTop: 6 }} />
      </CardBody>
    </Card>
  );
}
