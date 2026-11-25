import { Progress } from "@/components/vin/progress";

export function ProgressSizes() {
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 320 }}>
      <Progress aria-label="Small" size="sm" value={25} />
      <Progress aria-label="Medium" value={50} />
      <Progress aria-label="Large" size="lg" value={75} />
    </div>
  );
}
