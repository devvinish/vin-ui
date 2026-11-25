<script lang="ts">
  import ResizableGroup from "@/components/vin/resizable.svelte";
  import ResizablePanel from "@/components/vin/resizable-panel.svelte";
  import ResizableHandle from "@/components/vin/resizable-handle.svelte";
</script>

<ResizableGroup style="width: 100%; max-width: 520px; height: 200px">
  <ResizablePanel defaultSize={30} minSize={20}>
    <div style="padding: 16px">
      <p style="margin: 0 0 8px; font-weight: 600">Mailboxes</p>
      <p style="margin: 0; color: var(--vin-muted)">Inbox<br />Drafts<br />Sent<br />Archive</p>
    </div>
  </ResizablePanel>
  <ResizableHandle label="Resize mailboxes" withGrip />
  <ResizablePanel defaultSize={70} minSize={30}>
    <div style="padding: 16px">
      <p style="margin: 0 0 8px; font-weight: 600">Inbox</p>
      <p style="margin: 0; color: var(--vin-muted)">Drag the handle to give the list more room, or Tab to it and use the arrow keys.</p>
    </div>
  </ResizablePanel>
</ResizableGroup>
