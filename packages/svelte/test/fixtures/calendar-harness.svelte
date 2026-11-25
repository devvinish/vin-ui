<script lang="ts">
  import Calendar from "../../src/calendar.svelte";
  import DatePicker from "../../src/date-picker.svelte";

  let value = $state<string | null>("2026-11-14");
  let month = $state<string | undefined>(undefined);
</script>

<Calendar bind:value bind:month />
<DatePicker aria-label="Due date" bind:value />
<p data-testid="value">{value}</p>
<p data-testid="month">{month}</p>
<button type="button" onclick={() => (value = "2026-11-02")}>Set from outside</button>
