import { Dialog, DialogClose } from "@/components/vin/dialog";
import { Button } from "@/components/vin/button";

export function DialogScroll() {
  return (
    <Dialog
      trigger={<Button variant="outline">Read the terms</Button>}
      title="Terms of use"
      footer={
        <>
          <DialogClose><Button variant="outline">Decline</Button></DialogClose>
          <DialogClose><Button>Accept</Button></DialogClose>
        </>
      }
    >
      <p>VinUI is free and MIT licensed. You can use it in personal and commercial work, change it, and ship it in your own products.</p>
      <p>Keep the licence notice in copies of the source. You don't need to credit VinUI in your app, though a link is always welcome.</p>
      <p>The components come as they are, without a warranty. Test them in your own product before you ship.</p>
      <p>Fonts and icons used in the examples have their own licences. Check them before you use them.</p>
      <p>When the content is longer than the screen, the dialog scrolls inside and the page behind it stays put.</p>
    </Dialog>
  );
}
