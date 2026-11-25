import { Empty } from "@/components/vin/empty";
import { Button } from "@/components/vin/button";

export function EmptyOutline() {
  return (
    <Empty
      variant="outline"
      style={{ maxWidth: 420 }}
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>}
      title="Drop files here"
      description="PNG, JPG or PDF, up to 10 MB each."
      actions={<Button variant="outline" size="sm">Choose files</Button>}
    />
  );
}
