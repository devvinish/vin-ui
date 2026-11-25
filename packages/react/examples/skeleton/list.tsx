import { Skeleton } from "@/components/vin/skeleton";

const rows = [["40%", "90%"], ["55%", "75%"], ["35%", "80%"]];

export function SkeletonList() {
  return (
    <div role="status" aria-label="Loading messages" style={{ display: "grid", gap: 18, width: "100%", maxWidth: 320 }}>
      {rows.map(([a, b], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Skeleton shape="circle" style={{ width: 36 }} />
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            <Skeleton shape="text" style={{ width: a }} />
            <Skeleton shape="text" style={{ width: b }} />
          </div>
        </div>
      ))}
    </div>
  );
}
