import { AspectRatio } from "@/components/vin/aspect-ratio";

export function AspectRatioPortrait() {
  return (
    <AspectRatio ratio="3 / 4" style={{ width: 200 }}>
      <img src="/ui/media/lake.svg" alt="A lake below green hills" />
    </AspectRatio>
  );
}
