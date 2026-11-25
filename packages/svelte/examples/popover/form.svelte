<script lang="ts">
  import Popover from "@/components/vin/popover.svelte";
  import Button from "@/components/vin/button.svelte";
  import Field from "@/components/vin/input-field.svelte";
</script>

<Popover title="Dimensions" description="Set the size of the layer." style="width: 260px">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Dimensions</Button>{/snippet}
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
    <Field label="Width" size="sm" value="1200" />
    <Field label="Height" size="sm" value="800" />
  </div>
</Popover>
