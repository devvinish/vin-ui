<script lang="ts">
  import DatePicker from "@/components/vin/date-picker.svelte";
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 280px">
  <DatePicker mode="range" label="Trip dates" value={{ from: "2026-11-09", to: "2026-11-15" }} name="trip" />
</div>
