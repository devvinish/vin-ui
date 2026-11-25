import { Pagination } from "@/components/vin/pagination";

export function PaginationLabels() {
  return <Pagination page={1} count={3} labels href={(p) => `?page=${p}`} />;
}
