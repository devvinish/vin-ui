import * as React from "react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/vin/dropdown-menu";
import { Button } from "@/components/vin/button";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export function DropdownMenuIcons() {
  return (
    <DropdownMenu
      align="end"
      trigger={
        <Button variant="ghost" size="icon" aria-label="File actions">
          <Icon><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></Icon>
        </Button>
      }
    >
      <DropdownMenuItem icon={<Icon><path d="M12 20h9" /><path d="M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8l-4 1 1-4Z" /></Icon>}>Rename</DropdownMenuItem>
      <DropdownMenuItem icon={<Icon><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>}>Duplicate</DropdownMenuItem>
      <DropdownMenuItem icon={<Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></Icon>}>Download</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem danger icon={<Icon><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>}>Delete</DropdownMenuItem>
    </DropdownMenu>
  );
}
