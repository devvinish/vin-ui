import { ResizableGroup, ResizablePanel, ResizableHandle } from "@/components/vin/resizable";

const code = { margin: 0, padding: "12px 16px", font: "13px/1.6 ui-monospace, monospace" };

export function ResizableVertical() {
  return (
    <ResizableGroup orientation="vertical" style={{ width: "100%", maxWidth: 420, height: 260 }}>
      <ResizablePanel defaultSize={60} minSize={15}>
        <pre style={code}>{"export function greet(name) {\n  return `Hello, ${name}!`;\n}"}</pre>
      </ResizablePanel>
      <ResizableHandle label="Resize editor" withGrip />
      <ResizablePanel defaultSize={40} minSize={15}>
        <pre style={{ ...code, color: "var(--vin-muted)" }}>{"$ npm run dev\nReady on http://localhost:4321"}</pre>
      </ResizablePanel>
    </ResizableGroup>
  );
}
