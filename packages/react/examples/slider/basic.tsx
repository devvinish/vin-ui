import { Slider } from "@/components/vin/slider";

export function SliderBasic() {
  return <Slider label="Volume" defaultValue={40} showValue style={{ width: "100%", maxWidth: 320 }} />;
}
