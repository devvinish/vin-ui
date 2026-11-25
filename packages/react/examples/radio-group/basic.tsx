import { RadioGroup } from "@/components/vin/radio-group";

const options = [
  { value: "instant", label: "Instantly" },
  { value: "daily", label: "Once a day" },
  { value: "weekly", label: "Once a week" },
  { value: "never", label: "Never" },
];

export function RadioGroupBasic() {
  return <RadioGroup label="Email me" options={options} defaultValue="daily" />;
}
