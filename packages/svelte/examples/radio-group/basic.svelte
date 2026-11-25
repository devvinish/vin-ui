<script lang="ts">
  import RadioGroup from "@/components/vin/radio-group.svelte";

  const options = [
    { value: "instant", label: "Instantly" },
    { value: "daily", label: "Once a day" },
    { value: "weekly", label: "Once a week" },
    { value: "never", label: "Never" },
  ];
</script>

<RadioGroup label="Email me" {options} value="daily" />
