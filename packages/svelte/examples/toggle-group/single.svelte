<script lang="ts">
  import ToggleGroup from "@/components/vin/toggle-group.svelte";
  import ToggleGroupItem from "@/components/vin/toggle-group-item.svelte";
</script>

<ToggleGroup type="single" variant="outline" value="grid" aria-label="View">
  <ToggleGroupItem value="list">List</ToggleGroupItem>
  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
  <ToggleGroupItem value="board">Board</ToggleGroupItem>
</ToggleGroup>
