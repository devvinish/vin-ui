import { MessageScroller } from "@/components/vin/message-scroller";
import { Bubble, BubbleGroup } from "@/components/vin/bubble";

const chat: [from: "user" | "assistant", text: string][] = [
  ["user", "I'm going to Lisbon in March. Any tips?"],
  ["assistant", "March is lovely there: mild, and fewer crowds than summer. Bring good shoes, the hills are steep."],
  ["user", "Where should I stay?"],
  ["assistant", "Alfama for old streets and views, Chiado for shops and cafés, or Príncipe Real if you want somewhere quieter."],
  ["user", "How do I get from the airport?"],
  ["assistant", "The metro's red line goes straight to the city in about 25 minutes. A taxi takes 15 to 20 minutes."],
  ["user", "Is a day trip to Sintra worth it?"],
  ["assistant", "Yes. Take the train from Rossio, go early, and book Pena Palace tickets ahead."],
];

export function MessageScrollerBasic() {
  return (
    <MessageScroller outline style={{ width: "100%", maxWidth: 460, height: 320 }}>
      <BubbleGroup>
        {chat.map(([from, text], i) => <Bubble as="p" from={from} key={i}>{text}</Bubble>)}
      </BubbleGroup>
    </MessageScroller>
  );
}
