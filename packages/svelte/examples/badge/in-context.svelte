<script lang="ts">
  import Badge from "@/components/vin/badge.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Button variant="secondary">
  Inbox
  <Badge variant="primary">12</Badge>
</Button>
<Button variant="outline">
  Releases
  <Badge variant="success">New</Badge>
</Button>
