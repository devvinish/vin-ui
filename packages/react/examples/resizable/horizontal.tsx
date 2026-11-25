import { ResizableGroup, ResizablePanel, ResizableHandle } from "@/components/vin/resizable";

export function ResizableHorizontal() {
  return (
    <ResizableGroup style={{ width: "100%", maxWidth: 520, height: 200 }}>
      <ResizablePanel defaultSize={30} minSize={20}>
        <div style={{ padding: 16 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Mailboxes</p>
          <p style={{ margin: 0, color: "var(--vin-muted)" }}>Inbox<br />Drafts<br />Sent<br />Archive</p>
        </div>
      </ResizablePanel>
      <ResizableHandle label="Resize mailboxes" withGrip />
      <ResizablePanel defaultSize={70} minSize={30}>
        <div style={{ padding: 16 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Inbox</p>
          <p style={{ margin: 0, color: "var(--vin-muted)" }}>Drag the handle to give the list more room, or Tab to it and use the arrow keys.</p>
        </div>
      </ResizablePanel>
    </ResizableGroup>
  );
}
