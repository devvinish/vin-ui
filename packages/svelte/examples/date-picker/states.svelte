<script lang="ts">
  import DatePicker from "@/components/vin/date-picker.svelte";
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 280px">
  <DatePicker label="Start date" error="Choose a start date." />
  <DatePicker label="End date" value="2026-12-31" disabled />
</div>
