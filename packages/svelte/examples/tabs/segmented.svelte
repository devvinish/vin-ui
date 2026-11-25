<script lang="ts">
  import Tabs from "@/components/vin/tabs.svelte";
  import TabList from "@/components/vin/tabs-list.svelte";
  import Tab from "@/components/vin/tabs-tab.svelte";
  import TabPanel from "@/components/vin/tabs-panel.svelte";
</script>

<Tabs value="account" style="width: 100%; max-width: 380px">
  <TabList aria-label="Account settings">
    <Tab value="account">Account</Tab>
    <Tab value="password">Password</Tab>
    <Tab value="team">Team</Tab>
  </TabList>
  <TabPanel value="account">Change your name, email and profile picture.</TabPanel>
  <TabPanel value="password">Update your password and turn on two-step sign-in.</TabPanel>
  <TabPanel value="team">Invite people and manage their roles.</TabPanel>
</Tabs>
