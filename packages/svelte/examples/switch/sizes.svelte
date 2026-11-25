<script lang="ts">
  import Switch from "@/components/vin/switch.svelte";
</script>

<div style="display: grid; gap: 14px">
  <Switch label="Compact view" size="sm" checked />
  <Switch label="Beta features (managed)" checked disabled />
  <Switch label="Offline sync" disabled />
</div>
