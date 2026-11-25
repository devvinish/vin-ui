<script lang="ts">
  import ResizableGroup from "@/components/vin/resizable.svelte";
  import ResizablePanel from "@/components/vin/resizable-panel.svelte";
  import ResizableHandle from "@/components/vin/resizable-handle.svelte";

  const code = "margin: 0; padding: 12px 16px; font: 13px/1.6 ui-monospace, monospace";
</script>

<ResizableGroup orientation="vertical" style="width: 100%; max-width: 420px; height: 260px">
  <ResizablePanel defaultSize={60} minSize={15}>
    <pre style={code}>{"export function greet(name) {\n  return `Hello, ${name}!`;\n}"}</pre>
  </ResizablePanel>
  <ResizableHandle label="Resize editor" withGrip />
  <ResizablePanel defaultSize={40} minSize={15}>
    <pre style="{code}; color: var(--vin-muted)">{"$ npm run dev\nReady on http://localhost:4321"}</pre>
  </ResizablePanel>
</ResizableGroup>
