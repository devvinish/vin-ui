import { Bubble, BubbleGroup, TypingBubble } from "@/components/vin/bubble";

export function BubbleTyping() {
  return (
    <BubbleGroup style={{ width: "100%", maxWidth: 460 }}>
      <Bubble as="p" from="user">Summarise this thread for me.</Bubble>
      <TypingBubble />
    </BubbleGroup>
  );
}
