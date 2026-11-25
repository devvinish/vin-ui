import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarInset, SidebarItem, SidebarLayout, SidebarMenu, SidebarSub, SidebarTrigger,
} from "@/components/vin/sidebar";
import { Text } from "@/components/vin/typography";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export function SidebarBasic() {
  return (
    <SidebarLayout style={{ "--vin-sidebar-min-height": "420px", border: "1px solid var(--vin-border)", borderRadius: "var(--vin-radius-lg)", overflow: "clip" } as React.CSSProperties}>
      <Sidebar label="App">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarItem href="#home" icon={<Icon><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M8 15l4-7 4 7" /></Icon>}>Acme Inc</SidebarItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup label="Platform">
            <SidebarItem href="#dashboard" active icon={<Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></Icon>}>Dashboard</SidebarItem>
            <SidebarItem href="#inbox" badge="12" icon={<Icon><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></Icon>}>Inbox</SidebarItem>
            <SidebarItem href="#calendar" icon={<Icon><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>}>Calendar</SidebarItem>
            <SidebarSub label="Projects" defaultOpen icon={<Icon><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></Icon>}>
              <SidebarItem href="#website">Website</SidebarItem>
              <SidebarItem href="#mobile">Mobile app</SidebarItem>
            </SidebarSub>
          </SidebarGroup>
          <SidebarGroup label="Team">
            <SidebarItem href="#members" icon={<Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>}>Members</SidebarItem>
            <SidebarItem href="#settings" icon={<Icon><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></Icon>}>Settings</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarItem href="#help" icon={<Icon><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></Icon>}>Help</SidebarItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset style={{ padding: "12px 16px" }}>
        <SidebarTrigger />
        <Text variant="muted">Your projects, at a glance.</Text>
      </SidebarInset>
    </SidebarLayout>
  );
}
