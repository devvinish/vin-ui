import { Slider } from "@/components/vin/slider";

export function SliderRange() {
  return (
    <Slider
      label="Price"
      defaultValue={[200, 700]}
      min={0}
      max={1000}
      step={50}
      showValue
      formatValue={(v) => `₹${v}`}
      thumbLabels={["Minimum price", "Maximum price"]}
      name="price"
      style={{ width: "100%", maxWidth: 320 }}
    />
  );
}
