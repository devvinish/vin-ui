<script lang="ts">
  import MessageScroller from "@/components/vin/message-scroller.svelte";
  import Message from "@/components/vin/message.svelte";
  import Bubble from "@/components/vin/bubble.svelte";
  import TypingBubble from "@/components/vin/bubble-typing.svelte";
  import Avatar from "@/components/vin/avatar.svelte";
</script>

{#snippet assistant()}<Avatar name="Assistant" size="sm" shape="square" fallback="AI" />{/snippet}

<MessageScroller outline label="Chat with the assistant" style="width: 100%; max-width: 560px; height: 360px">
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
