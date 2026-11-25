import { Text, Code, Link } from "@/components/vin/typography";

export function TypographyText() {
  return (
    <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 520 }}>
      <Text variant="lead">Components you copy into your project, in the style you choose.</Text>
      <Text>
        Run <Code>npx @vinish/ui init</Code> once, then add what you need. Read the <Link href="#">installation guide</Link> for the details.
      </Text>
      <Text variant="muted">Works with plain HTML and with React.</Text>
      <Text variant="small">MIT licence. Free forever.</Text>
    </div>
  );
}
