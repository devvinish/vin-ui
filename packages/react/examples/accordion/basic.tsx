import { Accordion } from "@/components/vin/accordion";

const faq = [
  { value: "free", title: "Is VinUI free?", content: "Yes. Every component is MIT licensed, so you can use it in personal and commercial work." },
  { value: "react", title: "Do I need React?", content: "No. Each component comes as plain HTML and CSS too, with one small script for the interactive parts." },
  { value: "colours", title: "Can I change the colours?", content: "Pick any accent colour, light or dark mode, and one of eight styles." },
];

export function AccordionBasic() {
  return <Accordion items={faq} defaultValue={["free"]} style={{ maxWidth: 480 }} />;
}
