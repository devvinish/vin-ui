<!-- Nothing pressed, first item disabled: the first enabled item is the Tab stop. -->
<script lang="ts">
  import ToggleGroup from "../../src/toggle-group.svelte";
  import ToggleGroupItem from "../../src/toggle-group-item.svelte";
</script>

<ToggleGroup type="single" aria-label="View">
  <ToggleGroupItem value="list" disabled>List</ToggleGroupItem>
  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
  <ToggleGroupItem value="board">Board</ToggleGroupItem>
</ToggleGroup>
