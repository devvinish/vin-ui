import { AspectRatio } from "@/components/vin/aspect-ratio";

export function AspectRatioSquare() {
  return (
    <>
      <AspectRatio ratio={1} style={{ width: 160 }}>
        <img src="/ui/media/lake.svg" alt="A lake below green hills" />
      </AspectRatio>
      <AspectRatio ratio={1} style={{ width: 160 }}>
        <img src="/ui/media/mountains.svg" alt="Purple mountains at sunset" />
      </AspectRatio>
    </>
  );
}
