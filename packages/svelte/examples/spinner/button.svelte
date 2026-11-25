<script lang="ts">
  import Button from "@/components/vin/button.svelte";
  import Spinner from "@/components/vin/spinner.svelte";
</script>

<Button disabled>
  <Spinner size="sm" decorative />
  Saving…
</Button>
<Button variant="outline" disabled>
  <Spinner size="sm" decorative />
  Loading more
</Button>
