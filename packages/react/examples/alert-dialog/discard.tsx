import { AlertDialog } from "@/components/vin/alert-dialog";
import { Button } from "@/components/vin/button";

export function AlertDialogDiscard() {
  return (
    <AlertDialog
      trigger={<Button variant="outline">Close editor</Button>}
      title="Discard your changes?"
      description="You have edits that aren't saved yet."
      cancel="Keep editing"
      action="Discard"
      variant="default"
    />
  );
}
