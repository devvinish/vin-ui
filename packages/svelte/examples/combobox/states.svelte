<script lang="ts">
  import Combobox from "@/components/vin/combobox.svelte";

  const countries = [
    { value: "au", label: "Australia" },
    { value: "ca", label: "Canada" },
    { value: "in", label: "India" },
    { value: "jp", label: "Japan", disabled: true },
    { value: "gb", label: "United Kingdom" },
  ];
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
  <Combobox label="Country" options={countries} placeholder="Search countries…" error="Choose your country." />
  <Combobox label="Language" options={[{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }]} value="en" disabled />
</div>
