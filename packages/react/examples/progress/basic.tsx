import { Progress } from "@/components/vin/progress";

export function ProgressBasic() {
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 320 }}>
      <Progress label="Uploading design.fig" value={64} showValue />
      <Progress label="Backup complete" value={100} variant="success" showValue />
    </div>
  );
}
