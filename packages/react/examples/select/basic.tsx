import { Select } from "@/components/vin/select";

const frameworks = [
  { value: "astro", label: "Astro" },
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "sveltekit", label: "SvelteKit" },
];

export function SelectBasic() {
  return <Select label="Framework" options={frameworks} defaultValue="astro" name="framework" style={{ width: "100%", maxWidth: 320 }} />;
}
