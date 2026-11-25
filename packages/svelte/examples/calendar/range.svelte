<script lang="ts">
  import Calendar from "@/components/vin/calendar.svelte";
</script>

<Calendar mode="range" value={{ from: "2026-11-09", to: "2026-11-15" }} onValueChange={(range) => console.log(range)} />
