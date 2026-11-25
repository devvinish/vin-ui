import { Breadcrumb } from "@/components/vin/breadcrumb";

export function BreadcrumbBasic() {
  return <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Components", href: "#" }, { label: "Breadcrumb" }]} />;
}
