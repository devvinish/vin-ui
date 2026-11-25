import { MessageScroller } from "@/components/vin/message-scroller";
import { Message } from "@/components/vin/message";
import { Bubble, TypingBubble } from "@/components/vin/bubble";
import { Avatar } from "@/components/vin/avatar";

const assistant = <Avatar name="Assistant" size="sm" shape="square" fallback="AI" />;

export function MessageScrollerMessages() {
  return (
    <MessageScroller outline label="Chat with the assistant" style={{ width: "100%", maxWidth: 560, height: 360 }}>
      <Message align="end"><Bubble as="p" from="user">Write a haiku about code review.</Bubble></Message>
      <Message avatar={assistant} author="Assistant">
        <p>Small diff, big thoughts.<br />A nit becomes a thread:<br />approved, with comments.</p>
      </Message>
      <Message align="end"><Bubble as="p" from="user">Now one about deploying on a Friday.</Bubble></Message>
      <Message avatar={assistant} author="Assistant">
        <p>Green checks at five.<br />The weekend hums, then a page:<br />rollback by moonlight.</p>
      </Message>
      <Message align="end"><Bubble as="p" from="user">Ha. One more, about naming things?</Bubble></Message>
      <Message avatar={assistant}><TypingBubble /></Message>
    </MessageScroller>
  );
}
