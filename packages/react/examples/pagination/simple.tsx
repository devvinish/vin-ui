import { Pagination } from "@/components/vin/pagination";

export function PaginationSimple() {
  return <Pagination page={2} count={10} simple href={(p) => `?page=${p}`} />;
}
