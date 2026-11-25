import { Button } from "@/components/vin/button";
import { Separator } from "@/components/vin/separator";

export function SeparatorVertical() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Button variant="ghost" size="sm">Docs</Button>
      <Separator orientation="vertical" />
      <Button variant="ghost" size="sm">Components</Button>
      <Separator orientation="vertical" />
      <Button variant="ghost" size="sm">Blog</Button>
    </div>
  );
}
