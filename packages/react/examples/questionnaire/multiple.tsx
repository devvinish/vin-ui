import { Questionnaire } from "@/components/vin/questionnaire";

export function QuestionnaireMultiple() {
  return (
    <Questionnaire
      title="A few questions first"
      description="So I can plan the right trip for you."
      style={{ maxWidth: 440 }}
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
      defaultValues={{ who: ["solo"], see: ["lakes", "other"] }}
      defaultOther={{ see: "Wildflowers" }}
      onSubmit={(answers) => console.log(answers)}
    />
  );
}
