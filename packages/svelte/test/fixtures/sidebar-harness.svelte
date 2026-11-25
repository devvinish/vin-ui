<script lang="ts">
  import SidebarLayout from "../../src/sidebar-layout.svelte";
  import Sidebar from "../../src/sidebar.svelte";
  import SidebarContent from "../../src/sidebar-content.svelte";
  import SidebarGroup from "../../src/sidebar-group.svelte";
  import SidebarItem from "../../src/sidebar-item.svelte";
  import SidebarSub from "../../src/sidebar-sub.svelte";
  import SidebarTrigger from "../../src/sidebar-trigger.svelte";
  import SidebarInset from "../../src/sidebar-inset.svelte";

  let { collapsed = false }: { collapsed?: boolean } = $props();
  const initial = () => collapsed;
  let folded = $state(initial());
  let changes = $state<boolean[]>([]);
</script>

<SidebarLayout bind:collapsed={folded} onCollapsedChange={(on) => changes.push(on)}>
  <Sidebar label="App">
    <SidebarContent>
      <SidebarGroup label="Platform">
        <SidebarItem href="#dashboard">Dashboard</SidebarItem>
        <SidebarItem href="#inbox" active badge={4}>Inbox</SidebarItem>
        <SidebarSub label="Projects">
          <SidebarItem href="#website">Website</SidebarItem>
        </SidebarSub>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    <output data-testid="changes">{changes.join(",")}</output>
  </SidebarInset>
</SidebarLayout>
