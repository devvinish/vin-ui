<script lang="ts">
  import NativeSelect from "@/components/vin/native-select.svelte";
</script>

<div style="display: grid; gap: 12px; width: 100%; max-width: 240px">
  <NativeSelect size="sm" aria-label="Small"><option>Small</option><option>Medium</option></NativeSelect>
  <NativeSelect aria-label="Medium"><option>Medium</option><option>Small</option></NativeSelect>
  <NativeSelect size="lg" aria-label="Large"><option>Large</option><option>Medium</option></NativeSelect>
</div>
