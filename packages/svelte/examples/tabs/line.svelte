<script lang="ts">
  import Tabs from "@/components/vin/tabs.svelte";
  import TabList from "@/components/vin/tabs-list.svelte";
  import Tab from "@/components/vin/tabs-tab.svelte";
  import TabPanel from "@/components/vin/tabs-panel.svelte";
</script>

<Tabs value="overview" variant="line" style="width: 100%; max-width: 420px">
  <TabList aria-label="Project">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity">Activity</Tab>
    <Tab value="files">Files</Tab>
    <Tab value="archive" disabled>Archive</Tab>
  </TabList>
  <TabPanel value="overview">12 open tasks, 3 due this week.</TabPanel>
  <TabPanel value="activity">Latest changes from your team.</TabPanel>
  <TabPanel value="files">Shared documents and images.</TabPanel>
  <TabPanel value="archive">Archived items.</TabPanel>
</Tabs>
