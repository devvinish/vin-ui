import { Message, MessageCopy, MessageFeedback } from "@/components/vin/message";
import { Avatar } from "@/components/vin/avatar";
import { Bubble } from "@/components/vin/bubble";

export function MessageConversation() {
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", maxWidth: 560 }}>
      <Message
        align="end"
        avatar={<Avatar name="Ada Lovelace" size="sm" src="/ui/avatars/ada.svg" />}
        author="You"
        time="10:41"
        dateTime="2026-11-25T10:41"
      >
        <Bubble as="p" from="user">What does HTTP 429 mean?</Bubble>
      </Message>
      <Message
        avatar={<Avatar name="Assistant" size="sm" shape="square" fallback="AI" />}
        author="Assistant"
        time="10:41"
        dateTime="2026-11-25T10:41"
        actions={
          <>
            <MessageCopy />
            <MessageFeedback defaultValue="up" />
          </>
        }
      >
        <p><strong>429 Too Many Requests</strong> means you sent more requests than the server allows. Wait for the time in the <code>Retry-After</code> header, then try again.</p>
      </Message>
    </div>
  );
}
