import { CodeBlock } from "@/components/vin/code-block";

// Already highlighted (by hand here; Shiki or Prism output works the same way).
const k = (s: string) => `<span class="vin-code-block__keyword">${s}</span>`;
const str = (s: string) => `<span class="vin-code-block__string">${s}</span>`;
const num = (s: string) => `<span class="vin-code-block__number">${s}</span>`;
const comment = (s: string) => `<span class="vin-code-block__comment">${s}</span>`;

const html = [
  `${k("import")} { Button } ${k("from")} ${str('"@/components/vin/button"')};`,
  ``,
  `${k("export function")} SaveButton({ saving }: { saving: boolean }) {`,
  `  ${comment("// Disabled while the request is in flight.")}`,
  `  ${k("return")} &lt;Button disabled={saving} onClick={() =&gt; save({ retries: ${num("3")}, timeout: ${num("8000")} })}&gt;Save&lt;/Button&gt;;`,
  `}`,
].join("\n");

export function CodeBlockLines() {
  return <CodeBlock html={html} filename="save-button.tsx" language="tsx" lineNumbers highlight={[4, 5]} style={{ maxWidth: 520 }} />;
}
