import { Card, CardBody } from "@/components/vin/card";
import { Loading } from "@/components/vin/spinner";

export function SpinnerWithText() {
  return (
    <div style={{ display: "grid", gap: 20, justifyItems: "center", width: "100%", maxWidth: 300 }}>
      <Loading>Loading results…</Loading>
      <Card style={{ width: "100%" }}>
        <CardBody style={{ display: "grid", placeItems: "center", minHeight: 120 }}>
          <Loading variant="primary">Fetching invoices…</Loading>
        </CardBody>
      </Card>
    </div>
  );
}
