import { Skeleton } from "@/components/vin/skeleton";

export function SkeletonProfile() {
  return (
    <div role="status" aria-label="Loading profile" style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 280 }}>
      <Skeleton shape="circle" style={{ width: 44 }} />
      <div style={{ flex: 1, display: "grid", gap: 8 }}>
        <Skeleton shape="text" style={{ width: "70%" }} />
        <Skeleton shape="text" style={{ width: "45%" }} />
      </div>
    </div>
  );
}
