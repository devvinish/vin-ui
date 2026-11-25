import { Button } from "@/components/vin/button";
import { Spinner } from "@/components/vin/spinner";

export function SpinnerButton() {
  return (
    <>
      <Button disabled>
        <Spinner size="sm" decorative />
        Saving…
      </Button>
      <Button variant="outline" disabled>
        <Spinner size="sm" decorative />
        Loading more
      </Button>
    </>
  );
}
