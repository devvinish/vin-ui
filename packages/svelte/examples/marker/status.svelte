<script lang="ts">
  import StatusMarker from "@/components/vin/marker-status.svelte";
</script>

<div style="display: grid; gap: 10px; justify-items: start">
  <StatusMarker status="running">Searching the web…</StatusMarker>
  <StatusMarker status="done">Read 4 pages</StatusMarker>
  <StatusMarker status="error">Couldn't open example.com</StatusMarker>
</div>
