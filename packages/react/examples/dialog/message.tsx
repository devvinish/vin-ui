import { Dialog, DialogClose } from "@/components/vin/dialog";
import { Button } from "@/components/vin/button";

export function DialogMessage() {
  return (
    <Dialog
      trigger={<Button>Publish</Button>}
      title="Your site is live"
      description="Anyone with the link can see it now. It can take a minute to show up everywhere."
      footer={<DialogClose><Button>Got it</Button></DialogClose>}
    />
  );
}
