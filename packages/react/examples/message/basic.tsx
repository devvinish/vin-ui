import { Message, MessageAction, MessageCopy, MessageFeedback } from "@/components/vin/message";
import { Avatar } from "@/components/vin/avatar";

const RetryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
);

export function MessageBasic() {
  return (
    <Message
      style={{ maxWidth: 560 }}
      avatar={<Avatar name="Assistant" size="sm" shape="square" fallback="AI" />}
      author="Assistant"
      time="10:42"
      dateTime="2026-11-25T10:42"
      actions={
        <>
          <MessageCopy />
          <MessageAction label="Retry"><RetryIcon /></MessageAction>
          <MessageFeedback />
        </>
      }
    >
      <p>Here are three ways to speed up your build:</p>
      <ul>
        <li>Cache <code>node_modules</code> between runs.</li>
        <li>Run the tests in parallel.</li>
        <li>Only rebuild the packages that changed.</li>
      </ul>
    </Message>
  );
}
