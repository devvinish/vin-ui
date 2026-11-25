import { Sheet } from "@/components/vin/sheet";
import { Button } from "@/components/vin/button";
import { Link } from "@/components/vin/typography";

export function SheetLeft() {
  return (
    <Sheet side="left" trigger={<Button variant="outline">Menu</Button>} title="VinUI">
      <nav aria-label="Main" style={{ display: "grid", gap: 12 }}>
        <Link href="#docs">Docs</Link>
        <Link href="#components">Components</Link>
        <Link href="#styles">Styles</Link>
        <Link href="#changelog">Changelog</Link>
      </nav>
    </Sheet>
  );
}
