import { CodeBlock } from "@/components/vin/code-block";

export function CodeBlockPlain() {
  return <CodeBlock code="npx vinui@latest add code-block" copyLabel="Copy command" style={{ maxWidth: 520 }} />;
}
