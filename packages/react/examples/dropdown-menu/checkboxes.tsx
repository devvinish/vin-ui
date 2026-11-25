import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
} from "@/components/vin/dropdown-menu";
import { Button } from "@/components/vin/button";

export function DropdownMenuCheckboxes() {
  return (
    <DropdownMenu trigger={<Button variant="outline">View</Button>}>
      <DropdownMenuLabel>Show</DropdownMenuLabel>
      <DropdownMenuCheckboxItem defaultChecked>Toolbar</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem>Status bar</DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Sort by</DropdownMenuLabel>
      <DropdownMenuRadioGroup label="Sort by" defaultValue="name">
        <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="date">Date modified</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenu>
  );
}
