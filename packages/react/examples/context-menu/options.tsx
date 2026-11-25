import { ContextMenu } from "@/components/vin/context-menu";
import {
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/vin/dropdown-menu";

export function ContextMenuOptions() {
  return (
    <ContextMenu
      label="View options"
      style={{ width: "100%", maxWidth: 360 }}
      content={
        <>
          <DropdownMenuItem shortcut="⌘[">Back</DropdownMenuItem>
          <DropdownMenuItem shortcut="⌘R">Reload</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Show</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>Bookmarks bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Full URLs</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup label="Zoom" defaultValue="100">
            <DropdownMenuLabel>Zoom</DropdownMenuLabel>
            <DropdownMenuRadioItem value="90">90%</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="100">100%</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="125">125%</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </>
      }
    >
      Right-click for view options
    </ContextMenu>
  );
}
