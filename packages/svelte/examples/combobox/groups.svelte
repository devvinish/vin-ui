<script lang="ts">
  import Combobox from "@/components/vin/combobox.svelte";

  const zones = [
    { value: "Asia/Kolkata", label: "Kolkata", group: "Asia" },
    { value: "Asia/Singapore", label: "Singapore", group: "Asia" },
    { value: "Asia/Tokyo", label: "Tokyo", group: "Asia" },
    { value: "Europe/Berlin", label: "Berlin", group: "Europe" },
    { value: "Europe/London", label: "London", group: "Europe" },
    { value: "Europe/Paris", label: "Paris", group: "Europe" },
    { value: "America/New_York", label: "New York", group: "Americas" },
    { value: "America/Sao_Paulo", label: "São Paulo", group: "Americas" },
    { value: "America/Los_Angeles", label: "Los Angeles", group: "Americas" },
  ];
</script>

<Combobox label="Time zone" options={zones} value="Europe/London" emptyText="No time zones found." name="timezone" style="width: 100%; max-width: 320px" />
