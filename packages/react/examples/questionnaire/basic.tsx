import { Questionnaire } from "@/components/vin/questionnaire";

export function QuestionnaireBasic() {
  return (
    <Questionnaire
      label="Trip length"
      style={{ maxWidth: 440 }}
      questions={[
        {
          id: "length",
          prompt: "How long do you want to hike?",
          options: [
            { value: "short", label: "Under 2 hours" },
            { value: "half-day", label: "Half a day" },
            { value: "full-day", label: "A full day" },
          ],
          other: true,
        },
      ]}
      onSubmit={(answers) => console.log(answers)}
    />
  );
}
