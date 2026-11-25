<script lang="ts">
  import Sheet from "@/components/vin/sheet.svelte";
  import Button from "@/components/vin/button.svelte";
  import Field from "@/components/vin/input-field.svelte";
  import Checkbox from "@/components/vin/checkbox.svelte";
</script>

<Sheet title="Filters" description="Narrow the list of components." onSubmit={(data) => console.log(Object.fromEntries(data))}>
  {#snippet trigger(props)}<Button variant="outline" {...props}>Filters</Button>{/snippet}
  <Field label="Search" name="q" type="search" placeholder="Button, card…" />
  <Checkbox label="Forms" name="forms" checked />
  <Checkbox label="Overlays" name="overlays" />
  {#snippet footer(close)}
    <Button variant="outline" onclick={close}>Cancel</Button>
    <Button type="submit" value="apply">Show results</Button>
  {/snippet}
</Sheet>
