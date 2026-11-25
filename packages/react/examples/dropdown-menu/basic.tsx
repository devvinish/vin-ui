import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/vin/dropdown-menu";
import { Button } from "@/components/vin/button";

export function DropdownMenuBasic() {
  return (
    <DropdownMenu trigger={<Button variant="outline">My account</Button>}>
      <DropdownMenuLabel>Ada Lovelace</DropdownMenuLabel>
      <DropdownMenuItem shortcut="⇧⌘P">Profile</DropdownMenuItem>
      <DropdownMenuItem shortcut="⌘B">Billing</DropdownMenuItem>
      <DropdownMenuItem shortcut="⌘,">Settings</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Invite people</DropdownMenuItem>
      <DropdownMenuItem disabled>API (soon)</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem danger onSelect={() => console.log("signed out")}>Sign out</DropdownMenuItem>
    </DropdownMenu>
  );
}
