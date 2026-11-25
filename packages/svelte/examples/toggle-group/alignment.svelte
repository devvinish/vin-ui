<script lang="ts">
  import ToggleGroup from "@/components/vin/toggle-group.svelte";
  import ToggleGroupItem from "@/components/vin/toggle-group-item.svelte";
</script>

<ToggleGroup type="single" variant="outline" size="icon" value="left" aria-label="Text alignment">
  <ToggleGroupItem value="left" aria-label="Align left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 12H3M17 18H3M21 6H3" /></svg></ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 12H7M19 18H5M21 6H3" /></svg></ToggleGroupItem>
  <ToggleGroupItem value="right" aria-label="Align right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12H9M21 18H7M21 6H3" /></svg></ToggleGroupItem>
</ToggleGroup>
