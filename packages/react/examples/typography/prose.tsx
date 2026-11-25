import { Prose } from "@/components/vin/typography";

export function TypographyProse() {
  return (
    <Prose as="article" style={{ width: "100%", maxWidth: 520 }}>
      <h2>Getting started</h2>
      <p>VinUI gives you components as code you own. Nothing to update behind your back, and no <code>node_modules</code> to fight with.</p>
      <ul>
        <li>Choose one of eight styles.</li>
        <li>Set your accent colour.</li>
        <li>Add the components you need.</li>
      </ul>
      <blockquote>Good defaults, and every line is yours to change.</blockquote>
      <p>Next, see <a href="#">theming</a>.</p>
    </Prose>
  );
}
