import { Message } from "@/components/vin/message";
import { Avatar } from "@/components/vin/avatar";

export function MessageStreaming() {
  return (
    <Message
      streaming
      style={{ maxWidth: 560 }}
      avatar={<Avatar name="Assistant" size="sm" shape="square" fallback="AI" />}
      author="Assistant"
      time="Writing…"
    >
      <p>Sure. Start by opening the settings page and choosing</p>
    </Message>
  );
}
