import { Sidebar, SidebarContent, SidebarGroup, SidebarInset, SidebarItem, SidebarLayout, SidebarTrigger } from "@/components/vin/sidebar";
import { Text } from "@/components/vin/typography";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export function SidebarCollapsed() {
  return (
    <SidebarLayout defaultCollapsed style={{ "--vin-sidebar-min-height": "260px", border: "1px solid var(--vin-border)", borderRadius: "var(--vin-radius-lg)", overflow: "clip" } as React.CSSProperties}>
      <Sidebar label="Workspace">
        <SidebarContent>
          <SidebarGroup label="Workspace">
            <SidebarItem href="#overview" active icon={<Icon><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></Icon>}>Overview</SidebarItem>
            <SidebarItem href="#messages" badge="3" icon={<Icon><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></Icon>}>Messages</SidebarItem>
            <SidebarItem href="#schedule" icon={<Icon><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>}>Schedule</SidebarItem>
            <SidebarItem href="#preferences" icon={<Icon><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></Icon>}>Preferences</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset style={{ padding: "12px 16px" }}>
        <SidebarTrigger />
        <Text variant="muted">Point at an icon to see its name.</Text>
      </SidebarInset>
    </SidebarLayout>
  );
}
