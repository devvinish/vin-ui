<script lang="ts">
  import Collapsible from "@/components/vin/collapsible.svelte";
  import Field from "@/components/vin/input-field.svelte";
  import Checkbox from "@/components/vin/checkbox.svelte";
</script>

<Collapsible trigger="Advanced settings" open style="width: 100%; max-width: 360px" contentProps={{ style: "display: grid; gap: 12px" }}>
  <Field label="Timeout (seconds)" type="number" value="30" />
  <Checkbox label="Retry failed requests" checked />
</Collapsible>
