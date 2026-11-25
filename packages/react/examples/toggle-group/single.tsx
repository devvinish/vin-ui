import { ToggleGroup, ToggleGroupItem } from "@/components/vin/toggle-group";

export function ToggleGroupSingle() {
  return (
    <ToggleGroup type="single" variant="outline" defaultValue="grid" aria-label="View">
      <ToggleGroupItem value="list">List</ToggleGroupItem>
      <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      <ToggleGroupItem value="board">Board</ToggleGroupItem>
    </ToggleGroup>
  );
}
