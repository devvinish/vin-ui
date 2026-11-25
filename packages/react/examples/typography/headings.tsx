import { Heading } from "@/components/vin/typography";

export function TypographyHeadings() {
  return (
    <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 520 }}>
      <Heading level={1} as="h2">Build faster with VinUI</Heading>
      <Heading level={2} as="h3">Eight styles, one API</Heading>
      <Heading level={3} as="h4">Pick an accent colour</Heading>
      <Heading level={4} as="h5">Copy the code</Heading>
    </div>
  );
}
