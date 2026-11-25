import { Pagination } from "@/components/vin/pagination";

export function PaginationBasic() {
  return <Pagination page={2} count={10} href={(p) => `?page=${p}`} />;
}
