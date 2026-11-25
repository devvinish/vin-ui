import { CodeBlock } from "@/components/vin/code-block";

const code = `export default {
  style: "precision",
  accent: "#5b5bd6",
  mode: "system",
};`;

export function CodeBlockBasic() {
  return <CodeBlock code={code} filename="vinui.config.js" language="js" style={{ maxWidth: 520 }} />;
}
