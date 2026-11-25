import { ToggleGroup, ToggleGroupItem } from "@/components/vin/toggle-group";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export function ToggleGroupMultiple() {
  return (
    <ToggleGroup type="multiple" size="icon" defaultValue={["bold"]} aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="Bold"><Icon d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic"><Icon d="M19 4h-9M14 20H5M15 4 9 20" /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline"><Icon d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" /></ToggleGroupItem>
    </ToggleGroup>
  );
}
