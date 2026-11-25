import { Toast } from "@/components/vin/toast";

export function ToastAppearance() {
  return (
    <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 360 }}>
      <Toast variant="success" title="Payment received" description="We've emailed your receipt." />
      <Toast title="Message archived" action={{ label: "Undo", onClick: () => {} }} />
    </div>
  );
}
