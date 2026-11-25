import { RadioGroup } from "@/components/vin/radio-group";

const plans = [
  { value: "hobby", label: "Hobby", description: "Free for personal projects." },
  { value: "pro", label: "Pro", description: "For small teams, billed monthly." },
  { value: "enterprise", label: "Enterprise", description: "Single sign-on and priority support." },
];

export function RadioGroupCards() {
  return <RadioGroup label="Plan" options={plans} defaultValue="pro" variant="cards" style={{ width: "100%", maxWidth: 360 }} />;
}
