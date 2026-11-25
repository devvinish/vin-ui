<script lang="ts">
  import Questionnaire from "@/components/vin/questionnaire.svelte";
</script>

<Questionnaire
  title="A few questions first"
  description="So I can plan the right trip for you."
  style="max-width: 440px"
  questions={[
    {
      id: "who",
      prompt: "Who is coming?",
      options: [
        { value: "solo", label: "Just me" },
        { value: "friends", label: "Friends" },
        { value: "kids", label: "Family with kids" },
      ],
    },
    {
      id: "see",
      prompt: "What would you like to see?",
      hint: "Choose any.",
      multiple: true,
      options: [
        { value: "lakes", label: "Lakes" },
        { value: "views", label: "Mountain views" },
        { value: "waterfalls", label: "Waterfalls" },
      ],
      other: true,
    },
  ]}
  values={{ who: ["solo"], see: ["lakes", "other"] }}
  other={{ see: "Wildflowers" }}
  onSubmit={(answers) => console.log(answers)}
/>
