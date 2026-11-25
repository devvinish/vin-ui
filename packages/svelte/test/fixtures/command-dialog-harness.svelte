<script lang="ts">
  import CommandDialog from "../../src/command-dialog.svelte";

  let { onSelect }: { onSelect?: (value: string) => void } = $props();
  let open = $state(false);
</script>

<CommandDialog
  title="Search docs"
  bind:open
  {onSelect}
  groups={[
    { heading: "Pages", items: [{ value: "installation", label: "Installation" }, { value: "theming", label: "Theming", keywords: "colour accent" }] },
    { heading: "Theme", items: [{ value: "dark", label: "Dark mode" }] },
  ]}
>
  {#snippet trigger(props)}<button type="button" {...props}>Search docs</button>{/snippet}
</CommandDialog>
<p data-testid="state">{open ? "open" : "closed"}</p>
