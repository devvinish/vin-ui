import { StatusMarker } from "@/components/vin/marker";

export function MarkerStatus() {
  return (
    <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
      <StatusMarker status="running">Searching the web…</StatusMarker>
      <StatusMarker status="done">Read 4 pages</StatusMarker>
      <StatusMarker status="error">Couldn't open example.com</StatusMarker>
    </div>
  );
}
