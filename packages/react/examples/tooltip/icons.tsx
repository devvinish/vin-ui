import { Tooltip } from "@/components/vin/tooltip";
import { Button } from "@/components/vin/button";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export function TooltipIcons() {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <Tooltip content="Align left" label>
        <Button variant="ghost" size="icon"><Icon d="M4 6h16M4 12h10M4 18h14" /></Button>
      </Tooltip>
      <Tooltip content="Align centre" label>
        <Button variant="ghost" size="icon"><Icon d="M4 6h16M7 12h10M5 18h14" /></Button>
      </Tooltip>
      <Tooltip content="Align right" label>
        <Button variant="ghost" size="icon"><Icon d="M4 6h16M10 12h10M6 18h14" /></Button>
      </Tooltip>
    </div>
  );
}
