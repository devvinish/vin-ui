<script lang="ts">
  import ResizableGroup from "@/components/vin/resizable.svelte";
  import ResizablePanel from "@/components/vin/resizable-panel.svelte";
  import ResizableHandle from "@/components/vin/resizable-handle.svelte";
</script>

<ResizableGroup style="width: 100%; max-width: 560px; height: 260px">
  <ResizablePanel defaultSize={25} minSize={15}>
    <div style="padding: 16px; font-weight: 600">Files</div>
  </ResizablePanel>
  <ResizableHandle label="Resize files" />
  <ResizablePanel defaultSize={75} minSize={30}>
    <ResizableGroup orientation="vertical">
      <ResizablePanel defaultSize={65} minSize={20}>
        <div style="padding: 16px; font-weight: 600">Preview</div>
      </ResizablePanel>
      <ResizableHandle label="Resize preview" />
      <ResizablePanel defaultSize={35} minSize={20}>
        <div style="padding: 16px; font-weight: 600">Console</div>
      </ResizablePanel>
    </ResizableGroup>
  </ResizablePanel>
</ResizableGroup>
