<script lang="ts">
  import Sheet from "@/components/vin/sheet.svelte";
  import Button from "@/components/vin/button.svelte";
  import Link from "@/components/vin/typography-link.svelte";
</script>

<Sheet side="left" title="VinUI">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Menu</Button>{/snippet}
  <nav aria-label="Main" style="display: grid; gap: 12px">
    <Link href="#docs">Docs</Link>
    <Link href="#components">Components</Link>
    <Link href="#styles">Styles</Link>
    <Link href="#changelog">Changelog</Link>
  </nav>
</Sheet>
