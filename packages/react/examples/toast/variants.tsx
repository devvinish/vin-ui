import { Toaster, toast } from "@/components/vin/toast";
import { Button } from "@/components/vin/button";

export function ToastVariants() {
  return (
    <>
      <Button variant="outline" onClick={() => toast({ title: "Payment received", description: "We've emailed your receipt.", variant: "success" })}>Success</Button>
      <Button variant="outline" onClick={() => toast({ title: "Upload failed", description: "The file is larger than 10 MB.", variant: "danger" })}>Error</Button>
      <Button variant="outline" onClick={() => toast({ title: "Message archived", action: { label: "Undo", onClick: () => {} } })}>With action</Button>
      <Toaster />
    </>
  );
}
