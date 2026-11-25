<script lang="ts">
  import Slider from "@/components/vin/slider.svelte";
</script>

<Slider
  label="Price"
  value={[200, 700]}
  min={0}
  max={1000}
  step={50}
  showValue
  formatValue={(v) => `₹${v}`}
  thumbLabels={["Minimum price", "Maximum price"]}
  name="price"
  style="width: 100%; max-width: 320px"
/>
