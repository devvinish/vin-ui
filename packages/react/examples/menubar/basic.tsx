import { Menubar, MenubarMenu } from "@/components/vin/menubar";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/vin/dropdown-menu";

export function MenubarBasic() {
  return (
    <Menubar label="Editor">
      <MenubarMenu label="File">
        <DropdownMenuItem shortcut="⌘T">New tab</DropdownMenuItem>
        <DropdownMenuItem shortcut="⌘N">New window</DropdownMenuItem>
        <DropdownMenuItem disabled>New incognito window</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem shortcut="⌘P">Print…</DropdownMenuItem>
      </MenubarMenu>
      <MenubarMenu label="Edit">
        <DropdownMenuItem shortcut="⌘Z">Undo</DropdownMenuItem>
        <DropdownMenuItem shortcut="⇧⌘Z">Redo</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Cut</DropdownMenuItem>
        <DropdownMenuItem>Copy</DropdownMenuItem>
        <DropdownMenuItem>Paste</DropdownMenuItem>
      </MenubarMenu>
      <MenubarMenu label="View">
        <DropdownMenuItem shortcut="⌘+">Zoom in</DropdownMenuItem>
        <DropdownMenuItem shortcut="⌘−">Zoom out</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Full screen</DropdownMenuItem>
      </MenubarMenu>
    </Menubar>
  );
}
