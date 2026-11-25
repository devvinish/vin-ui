<script lang="ts">
  import Drawer from "@/components/vin/drawer.svelte";
  import Button from "@/components/vin/button.svelte";
  import Field from "@/components/vin/input-field.svelte";
</script>

<Drawer title="Daily goal" description="How many minutes do you want to practise each day?">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Set daily goal</Button>{/snippet}
  <Field label="Minutes a day" type="number" inputmode="numeric" min={5} max={240} step={5} value={30} />
  {#snippet footer(close)}
    <Button variant="outline" onclick={close}>Cancel</Button>
    <Button onclick={close}>Save goal</Button>
  {/snippet}
</Drawer>
