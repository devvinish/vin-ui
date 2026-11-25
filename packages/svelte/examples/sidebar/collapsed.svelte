<script lang="ts">
  import SidebarLayout from "@/components/vin/sidebar-layout.svelte";
  import Sidebar from "@/components/vin/sidebar.svelte";
  import SidebarContent from "@/components/vin/sidebar-content.svelte";
  import SidebarGroup from "@/components/vin/sidebar-group.svelte";
  import SidebarItem from "@/components/vin/sidebar-item.svelte";
  import SidebarTrigger from "@/components/vin/sidebar-trigger.svelte";
  import SidebarInset from "@/components/vin/sidebar-inset.svelte";
  import Text from "@/components/vin/typography.svelte";

  let collapsed = $state(true);
</script>

{#snippet home()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>{/snippet}
{#snippet inbox()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>{/snippet}
{#snippet calendar()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>{/snippet}
{#snippet settings()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></svg>{/snippet}

<SidebarLayout bind:collapsed style="--vin-sidebar-min-height: 260px; border: 1px solid var(--vin-border); border-radius: var(--vin-radius-lg); overflow: clip">
  <Sidebar label="Workspace">
    <SidebarContent>
      <SidebarGroup label="Workspace">
        <SidebarItem href="#overview" active icon={home}>Overview</SidebarItem>
        <SidebarItem href="#messages" badge="3" icon={inbox}>Messages</SidebarItem>
        <SidebarItem href="#schedule" icon={calendar}>Schedule</SidebarItem>
        <SidebarItem href="#preferences" icon={settings}>Preferences</SidebarItem>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset style="padding: 12px 16px">
    <SidebarTrigger />
    <Text variant="muted">Point at an icon to see its name.</Text>
  </SidebarInset>
</SidebarLayout>
