import * as React from "react";
import { ContextMenu } from "@/components/vin/context-menu";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/vin/dropdown-menu";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export function ContextMenuBasic() {
  return (
    <ContextMenu
      label="File actions"
      style={{ width: "100%", maxWidth: 360 }}
      content={
        <>
          <DropdownMenuItem icon={<Icon><path d="M12 20h9" /><path d="M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8l-4 1 1-4Z" /></Icon>}>Rename</DropdownMenuItem>
          <DropdownMenuItem icon={<Icon><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem icon={<Icon><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></Icon>}>Copy link</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem danger icon={<Icon><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>}>Delete</DropdownMenuItem>
        </>
      }
    >
      Right-click here, or focus and press Shift+F10
    </ContextMenu>
  );
}
