import { Breadcrumb } from "@/components/vin/breadcrumb";

export function BreadcrumbChevron() {
  return <Breadcrumb separator="chevron" items={[{ label: "Docs", href: "#" }, { label: "Getting started", href: "#" }, { label: "Installation" }]} />;
}
