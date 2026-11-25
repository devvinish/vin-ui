<script lang="ts">
  import Select from "@/components/vin/select.svelte";

  const zones = [
    { value: "ist", label: "India (IST)" },
    { value: "gmt", label: "London (GMT)" },
    { value: "pst", label: "Los Angeles (PST)", disabled: true },
    { value: "jst", label: "Tokyo (JST)" },
  ];
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
  <Select label="Time zone" options={zones} placeholder="Choose a time zone" error="Choose a time zone." />
  <Select label="Currency" options={["INR", "USD"]} value="INR" disabled />
</div>
