<script lang="ts">
  import Message from "@/components/vin/message.svelte";
  import MessageCopy from "@/components/vin/message-copy.svelte";
  import MessageFeedback from "@/components/vin/message-feedback.svelte";
  import Avatar from "@/components/vin/avatar.svelte";
  import Bubble from "@/components/vin/bubble.svelte";
</script>

{#snippet assistant()}<Avatar name="Assistant" size="sm" shape="square" fallback="AI" />{/snippet}
{#snippet ada()}<Avatar name="Ada Lovelace" size="sm" src="/ui/avatars/ada.svg" />{/snippet}

<div style="display: grid; gap: 20px; width: 100%; max-width: 560px">
  <Message align="end" avatar={ada} author="You" time="10:41" dateTime="2026-11-25T10:41">
    <Bubble as="p" from="user">What does HTTP 429 mean?</Bubble>
  </Message>
  <Message avatar={assistant} author="Assistant" time="10:41" dateTime="2026-11-25T10:41">
    <p>
      <strong>429 Too Many Requests</strong> means you sent more requests than the server allows. Wait for the time in the <code>Retry-After</code> header,
      then try again.
    </p>
    {#snippet actions()}
      <MessageCopy />
      <MessageFeedback value="up" />
    {/snippet}
  </Message>
</div>
