import { AlertDialog } from "@/components/vin/alert-dialog";
import { Button } from "@/components/vin/button";

export function AlertDialogBasic() {
  return (
    <AlertDialog
      trigger={<Button variant="danger">Delete project</Button>}
      title="Delete this project?"
      description={`This deletes "Website redesign" and its 24 files for everyone. You can't undo it.`}
      action="Delete project"
      onAction={() => console.log("deleted")}
    />
  );
}
