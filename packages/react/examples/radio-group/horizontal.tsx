import { RadioGroup } from "@/components/vin/radio-group";

const sizes = [
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL (sold out)", disabled: true },
];

export function RadioGroupHorizontal() {
  return <RadioGroup label="Size" options={sizes} defaultValue="m" orientation="horizontal" />;
}
