<script lang="ts">
  import Questionnaire from "@/components/vin/questionnaire.svelte";
</script>

<Questionnaire
  label="Trip length"
  style="max-width: 440px"
  state="submitted"
  values={{ length: ["half-day"] }}
  questions={[
    {
    id: "length",
    prompt: "How long do you want to hike?",
    options: [
      { value: "short", label: "Under 2 hours" },
      { value: "half-day", label: "Half a day" },
      { value: "full-day", label: "A full day" },
    ],
    },
  ]}
/>
