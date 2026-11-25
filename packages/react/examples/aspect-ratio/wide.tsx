import { AspectRatio } from "@/components/vin/aspect-ratio";

export function AspectRatioWide() {
  return (
    <AspectRatio ratio="16 / 9" style={{ maxWidth: 480 }}>
      <img src="/ui/media/mountains.svg" alt="Purple mountains at sunset" />
    </AspectRatio>
  );
}
