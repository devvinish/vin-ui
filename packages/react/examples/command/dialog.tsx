import * as React from "react";
import { CommandDialog } from "@/components/vin/command";
import { Button } from "@/components/vin/button";
import { Kbd, KbdGroup } from "@/components/vin/kbd";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const page = <Icon><path d="M14 2.5H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-11Z" /><path d="M14 2.5v6h6" /></Icon>;
const sun = <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;

export function CommandDialogExample() {
  return (
    <CommandDialog
      title="Search docs"
      footer
      trigger={<Button variant="outline">Search docs… <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup></Button>}
      onSelect={(value) => console.log(value)}
      groups={[
        {
          heading: "Pages",
          items: [
            { value: "installation", label: "Installation", href: "#installation", icon: page },
            { value: "theming", label: "Theming", href: "#theming", keywords: "colour color accent", icon: <Icon><circle cx="13.5" cy="6.5" r="1" /><circle cx="17.5" cy="10.5" r="1" /><circle cx="8.5" cy="7.5" r="1" /><circle cx="6.5" cy="12.5" r="1" /><path d="M12 2a10 10 0 0 0 0 20c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7h2A5.6 5.6 0 0 0 22 11c0-5-4.5-9-10-9Z" /></Icon> },
            { value: "cli", label: "CLI", href: "#cli", keywords: "command line npx", icon: page },
          ],
        },
        {
          heading: "Theme",
          items: [
            { value: "light", label: "Light mode", icon: sun },
            { value: "dark", label: "Dark mode", keywords: "night", icon: sun },
          ],
        },
      ]}
    />
  );
}
