import { Accordion } from "@/components/vin/accordion";

const items = [
  { value: "shipping", title: "Shipping", content: "Orders leave our warehouse within two working days." },
  { value: "returns", title: "Returns", content: "Send it back within 30 days for a full refund." },
  { value: "warranty", title: "Warranty", content: "Two years on every product, parts and labour." },
];

export function AccordionMultiple() {
  return <Accordion type="multiple" items={items} defaultValue={["shipping", "returns"]} style={{ maxWidth: 480 }} />;
}
