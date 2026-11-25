import { Tabs, TabList, Tab, TabPanel } from "@/components/vin/tabs";

export function TabsSegmented() {
  return (
    <Tabs defaultValue="account" style={{ width: "100%", maxWidth: 380 }}>
      <TabList aria-label="Account settings">
        <Tab value="account">Account</Tab>
        <Tab value="password">Password</Tab>
        <Tab value="team">Team</Tab>
      </TabList>
      <TabPanel value="account">Change your name, email and profile picture.</TabPanel>
      <TabPanel value="password">Update your password and turn on two-step sign-in.</TabPanel>
      <TabPanel value="team">Invite people and manage their roles.</TabPanel>
    </Tabs>
  );
}
