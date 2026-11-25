import { Accordion } from "@/components/vin/accordion";

const plans = [
  { value: "free", title: "Free", content: "All components, all styles, for one project." },
  { value: "team", title: "Team", content: "Shared themes and up to 10 people." },
  { value: "enterprise", title: "Enterprise", content: "Single sign-on and priority support." },
];

export function AccordionOutline() {
  return <Accordion variant="outline" items={plans} defaultValue={["free"]} style={{ maxWidth: 480 }} />;
}
