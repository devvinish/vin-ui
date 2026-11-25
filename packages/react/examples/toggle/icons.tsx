import { Toggle } from "@/components/vin/toggle";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export function ToggleIcons() {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <Toggle size="icon" aria-label="Bold" defaultPressed><Icon d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" /></Toggle>
      <Toggle size="icon" aria-label="Italic"><Icon d="M19 4h-9M14 20H5M15 4 9 20" /></Toggle>
      <Toggle size="icon" aria-label="Underline"><Icon d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" /></Toggle>
    </div>
  );
}
