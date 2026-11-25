import { ResizableGroup, ResizablePanel, ResizableHandle } from "@/components/vin/resizable";

export function ResizableNested() {
  return (
    <ResizableGroup style={{ width: "100%", maxWidth: 560, height: 260 }}>
      <ResizablePanel defaultSize={25} minSize={15}>
        <div style={{ padding: 16, fontWeight: 600 }}>Files</div>
      </ResizablePanel>
      <ResizableHandle label="Resize files" />
      <ResizablePanel defaultSize={75} minSize={30}>
        <ResizableGroup orientation="vertical">
          <ResizablePanel defaultSize={65} minSize={20}>
            <div style={{ padding: 16, fontWeight: 600 }}>Preview</div>
          </ResizablePanel>
          <ResizableHandle label="Resize preview" />
          <ResizablePanel defaultSize={35} minSize={20}>
            <div style={{ padding: 16, fontWeight: 600 }}>Console</div>
          </ResizablePanel>
        </ResizableGroup>
      </ResizablePanel>
    </ResizableGroup>
  );
}
