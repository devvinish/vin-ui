<!-- Two-way binding: each control's value is mirrored in an <output>. -->
<script lang="ts">
  import Tabs from "../../src/tabs.svelte";
  import TabList from "../../src/tabs-list.svelte";
  import Tab from "../../src/tabs-tab.svelte";
  import TabPanel from "../../src/tabs-panel.svelte";
  import Switch from "../../src/switch.svelte";
  import Toggle from "../../src/toggle.svelte";
  import Select from "../../src/select.svelte";
  import Collapsible from "../../src/collapsible.svelte";

  let tab = $state("a");
  let on = $state(false);
  let pressed = $state(false);
  let fruit = $state("apple");
  let open = $state(false);
</script>

<Tabs bind:value={tab}>
  <TabList aria-label="Letters">
    <Tab value="a">A</Tab>
    <Tab value="b">B</Tab>
  </TabList>
  <TabPanel value="a">Panel A</TabPanel>
  <TabPanel value="b">Panel B</TabPanel>
</Tabs>
<Switch label="Wi-Fi" bind:checked={on} />
<Toggle bind:pressed aria-label="Bold">B</Toggle>
<Select aria-label="Fruit" options={["apple", "banana"]} bind:value={fruit} />
<Collapsible trigger="More" bind:open>Hidden text</Collapsible>
<button type="button" onclick={() => (tab = "b")}>Show B</button>
<output data-testid="state">{tab}|{on}|{pressed}|{fruit}|{open}</output>
