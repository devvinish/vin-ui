import { Questionnaire } from "@/components/vin/questionnaire";

export function QuestionnaireSubmitted() {
  return (
    <Questionnaire
      label="Trip length"
      style={{ maxWidth: 440 }}
      defaultState="submitted"
      defaultValues={{ length: ["half-day"] }}
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
  );
}
