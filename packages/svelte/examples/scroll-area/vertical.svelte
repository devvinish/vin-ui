<script lang="ts">
  import ScrollArea from "@/components/vin/scroll-area.svelte";
  import Separator from "@/components/vin/separator.svelte";

  const releases = ["v2.4.0", "v2.3.1", "v2.3.0", "v2.2.0", "v2.1.2", "v2.1.1", "v2.1.0", "v2.0.0", "v1.9.0", "v1.8.0"];
</script>

<ScrollArea label="Releases" style="width: 100%; max-width: 240px; height: 220px">
  <div style="padding: 12px 16px">
    <p style="margin: 0 0 8px; font-weight: 600">Releases</p>
    {#each releases as r, i (r)}
      {#if i > 0}<Separator />{/if}
      <div style="padding: 6px 0">{r}</div>
    {/each}
  </div>
</ScrollArea>
