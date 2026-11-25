<script lang="ts">
  import Progress from "@/components/vin/progress.svelte";
</script>

<div style="display: grid; gap: 20px; width: 100%; max-width: 320px">
  <Progress label="Uploading design.fig" value={64} showValue />
  <Progress label="Backup complete" value={100} variant="success" showValue />
</div>
