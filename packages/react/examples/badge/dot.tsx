import { Badge } from "@/components/vin/badge";

export function BadgeDot() {
  return (
    <>
      <Badge variant="success" dot>Online</Badge>
      <Badge variant="warning" dot>Degraded</Badge>
      <Badge variant="danger" dot>Offline</Badge>
      <Badge dot>Paused</Badge>
    </>
  );
}
