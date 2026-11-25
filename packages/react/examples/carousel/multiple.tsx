import { Carousel } from "@/components/vin/carousel";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/vin/card";

const styles = [
  ["Precision", "Crisp hairlines, quiet depth."],
  ["Tactile", "Physical, pressable buttons."],
  ["Clay", "Puffy, friendly, inflated."],
  ["Tonal", "Colour-led, pill shapes, springy."],
  ["Editorial", "Typographic, airy, magazine."],
  ["Terminal", "Developer-native, monospace."],
  ["Paper", "Warm, hand-made, human."],
  ["Bento", "Calm, layered, borderless."],
];

export function CarouselMultiple() {
  return (
    <Carousel label="The eight styles" perView={3} dots={false}>
      {styles.map(([name, text]) => (
        <Card key={name}>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{text}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </Carousel>
  );
}
