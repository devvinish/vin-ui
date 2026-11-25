import { ToggleGroup, ToggleGroupItem } from "@/components/vin/toggle-group";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export function ToggleGroupAlignment() {
  return (
    <ToggleGroup type="single" variant="outline" size="icon" defaultValue="left" aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Align left"><Icon d="M15 12H3M17 18H3M21 6H3" /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><Icon d="M17 12H7M19 18H5M21 6H3" /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><Icon d="M21 12H9M21 18H7M21 6H3" /></ToggleGroupItem>
    </ToggleGroup>
  );
}
