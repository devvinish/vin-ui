<script lang="ts">
  import Skeleton from "@/components/vin/skeleton.svelte";
</script>

<div role="status" aria-label="Loading profile" style="display: flex; align-items: center; gap: 12px; width: 100%; max-width: 280px">
  <Skeleton shape="circle" style="width: 44px" />
  <div style="flex: 1; display: grid; gap: 8px">
    <Skeleton shape="text" style="width: 70%" />
    <Skeleton shape="text" style="width: 45%" />
  </div>
</div>
