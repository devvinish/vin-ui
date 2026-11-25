import { Menubar, MenubarMenu } from "@/components/vin/menubar";
import {
  DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
} from "@/components/vin/dropdown-menu";

export function MenubarOptions() {
  return (
    <Menubar label="Browser">
      <MenubarMenu label="Show">
        <DropdownMenuCheckboxItem defaultChecked>Bookmarks bar</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Full URLs</DropdownMenuCheckboxItem>
      </MenubarMenu>
      <MenubarMenu label="Profiles">
        <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
        <DropdownMenuRadioGroup label="Profile" defaultValue="ada">
          <DropdownMenuRadioItem value="ada">Ada</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="grace">Grace</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="linus">Linus</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Add profile…</DropdownMenuItem>
      </MenubarMenu>
    </Menubar>
  );
}
