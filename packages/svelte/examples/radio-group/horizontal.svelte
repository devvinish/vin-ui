<script lang="ts">
  import RadioGroup from "@/components/vin/radio-group.svelte";

  const sizes = [
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL (sold out)", disabled: true },
  ];
</script>

<RadioGroup label="Size" options={sizes} value="m" orientation="horizontal" />
