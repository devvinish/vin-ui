import { Carousel } from "@/components/vin/carousel";
import { Heading, Text } from "@/components/vin/typography";

const steps = [
  ["Pick a style", "Eight looks, one set of components."],
  ["Choose an accent", "Any colour. Text on it stays readable."],
  ["Copy the code", "Plain HTML or React. No build step needed."],
  ["Ship it", "Light, dark and accessible out of the box."],
];

const panel = {
  display: "grid", alignContent: "end", gap: 6, minHeight: 200, padding: 28,
  borderRadius: "var(--vin-radius-lg)", background: "color-mix(in srgb, var(--vin-accent) 13%, transparent)",
} as const;

export function CarouselBasic() {
  return (
    <Carousel label="Getting started" style={{ maxWidth: 520 }}>
      {steps.map(([title, text]) => (
        <div key={title} style={panel}>
          <Heading level={3} style={{ margin: 0 }}>{title}</Heading>
          <Text style={{ margin: 0 }}>{text}</Text>
        </div>
      ))}
    </Carousel>
  );
}
