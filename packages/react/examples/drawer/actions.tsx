import * as React from "react";
import { Drawer, DrawerClose } from "@/components/vin/drawer";
import { Button } from "@/components/vin/button";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export function DrawerActions() {
  return (
    <Drawer trigger={<Button variant="outline">Photo options</Button>} title="Sunset over the bay.jpg">
      <DrawerClose><Button variant="ghost"><Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></Icon>Save to device</Button></DrawerClose>
      <DrawerClose><Button variant="ghost"><Icon><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></Icon>Copy link</Button></DrawerClose>
      <DrawerClose><Button variant="ghost"><Icon><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></Icon>Report a problem</Button></DrawerClose>
    </Drawer>
  );
}
