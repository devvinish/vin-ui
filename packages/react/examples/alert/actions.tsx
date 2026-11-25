import * as React from "react";
import { Alert } from "@/components/vin/alert";
import { Button } from "@/components/vin/button";

export function AlertActions() {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;
  return (
    <Alert
      variant="warning"
      title="Storage almost full"
      style={{ maxWidth: 480 }}
      onDismiss={() => setOpen(false)}
      actions={
        <>
          <Button size="sm">Upgrade</Button>
          <Button variant="outline" size="sm">Manage files</Button>
        </>
      }
    >
      You've used 9.2 GB of 10 GB. Upgrade or delete old files.
    </Alert>
  );
}
