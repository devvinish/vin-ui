import { Slider } from "@/components/vin/slider";

export function SliderStates() {
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 320 }}>
      <Slider label="Brightness" defaultValue={70} step={10} showValue formatValue={(v) => `${v}%`} />
      <Slider label="Bass (locked)" defaultValue={30} disabled />
    </div>
  );
}
