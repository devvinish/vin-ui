<script lang="ts">
  import Empty from "@/components/vin/empty.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Empty style="max-width: 420px" title="No projects yet" description="Projects keep your components and theme together. Create one to get started.">
  {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-8l-2-3H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z" /></svg>{/snippet}
  {#snippet actions()}<Button>Create project</Button><Button variant="outline">Import</Button>{/snippet}
</Empty>
