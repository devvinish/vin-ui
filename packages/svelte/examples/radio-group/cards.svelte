<script lang="ts">
  import RadioGroup from "@/components/vin/radio-group.svelte";

  const plans = [
    { value: "hobby", label: "Hobby", description: "Free for personal projects." },
    { value: "pro", label: "Pro", description: "For small teams, billed monthly." },
    { value: "enterprise", label: "Enterprise", description: "Single sign-on and priority support." },
  ];
</script>

<RadioGroup label="Plan" options={plans} value="pro" variant="cards" style="width: 100%; max-width: 360px" />
