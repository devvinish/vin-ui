import { Dialog, DialogClose } from "@/components/vin/dialog";
import { Button } from "@/components/vin/button";
import { Field } from "@/components/vin/input";

export function DialogBasic() {
  return (
    <Dialog
      trigger={<Button variant="outline">Edit profile</Button>}
      title="Edit profile"
      description="Change your public details. Save when you're done."
      onSubmit={(data) => console.log(Object.fromEntries(data))}
      footer={
        <>
          <DialogClose><Button variant="outline">Cancel</Button></DialogClose>
          <Button type="submit" value="save">Save changes</Button>
        </>
      }
    >
      <Field label="Name" name="name" defaultValue="Ada Lovelace" autoComplete="name" />
      <Field label="Username" name="username" defaultValue="@ada" autoComplete="username" />
    </Dialog>
  );
}
