<script lang="ts">
  import Slider from "@/components/vin/slider.svelte";
</script>

<div style="display: grid; gap: 20px; width: 100%; max-width: 320px">
  <Slider label="Brightness" value={70} step={10} showValue formatValue={(v) => `${v}%`} />
  <Slider label="Bass (locked)" value={30} disabled />
</div>
