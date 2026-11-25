import { Spinner } from "@/components/vin/spinner";

export function SpinnerBasic() {
  return (
    <>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner size="lg" variant="primary" />
    </>
  );
}
