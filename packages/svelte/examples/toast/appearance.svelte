<script lang="ts">
  import Toast from "@/components/vin/toast.svelte";
</script>

<div style="display: grid; gap: 10px; width: 100%; max-width: 360px">
  <Toast variant="success" title="Payment received" description="We've emailed your receipt." />
  <Toast title="Message archived" action={{ label: "Undo", onClick: () => {} }} />
</div>
