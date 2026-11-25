<script lang="ts">
  import Accordion from "@/components/vin/accordion.svelte";

  const plans = [
    { value: "free", title: "Free", content: "All components, all styles, for one project." },
    { value: "team", title: "Team", content: "Shared themes and up to 10 people." },
    { value: "enterprise", title: "Enterprise", content: "Single sign-on and priority support." },
  ];
</script>

<Accordion variant="outline" items={plans} value={["free"]} style="max-width: 480px" />
