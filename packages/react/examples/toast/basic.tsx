import { Toaster, toast } from "@/components/vin/toast";
import { Button } from "@/components/vin/button";

export function ToastBasic() {
  return (
    <>
      <Button variant="outline" onClick={() => toast("Changes saved")}>Save changes</Button>
      <Toaster />
    </>
  );
}
