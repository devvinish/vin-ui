<script lang="ts">
  import Calendar from "@/components/vin/calendar.svelte";
</script>

<Calendar value="2026-11-14" onValueChange={(date) => console.log(date)} />
