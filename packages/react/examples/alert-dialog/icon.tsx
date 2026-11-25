import { AlertDialog } from "@/components/vin/alert-dialog";
import { Button } from "@/components/vin/button";

export function AlertDialogIcon() {
  return (
    <AlertDialog
      trigger={<Button variant="outline">Revoke key</Button>}
      icon
      title="Revoke this API key?"
      description="Apps that use it stop working at once. Make a new key first if you still need access."
      cancel="Keep key"
      action="Revoke key"
    />
  );
}
