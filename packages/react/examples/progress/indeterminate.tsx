import { Progress } from "@/components/vin/progress";

export function ProgressIndeterminate() {
  return <Progress label="Preparing your export" style={{ width: "100%", maxWidth: 320 }} />;
}
