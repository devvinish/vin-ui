<script setup lang="ts">
import MessageScroller from "@/components/vin/message-scroller.vue";
import Message from "@/components/vin/message.vue";
import Avatar from "@/components/vin/avatar.vue";
import Bubble, { TypingBubble } from "@/components/vin/bubble.vue";
</script>

<template>
  <MessageScroller outline label="Chat with the assistant" style="width: 100%; max-width: 560px; height: 360px">
    <Message align="end"><Bubble as="p" from="user">Write a haiku about code review.</Bubble></Message>
    <Message author="Assistant">
      <template #avatar><Avatar name="Assistant" size="sm" shape="square" fallback="AI" /></template>
      <p>Small diff, big thoughts.<br />A nit becomes a thread:<br />approved, with comments.</p>
    </Message>
    <Message align="end"><Bubble as="p" from="user">Now one about deploying on a Friday.</Bubble></Message>
    <Message author="Assistant">
      <template #avatar><Avatar name="Assistant" size="sm" shape="square" fallback="AI" /></template>
      <p>Green checks at five.<br />The weekend hums, then a page:<br />rollback by moonlight.</p>
    </Message>
    <Message align="end"><Bubble as="p" from="user">Ha. One more, about naming things?</Bubble></Message>
    <Message>
      <template #avatar><Avatar name="Assistant" size="sm" shape="square" fallback="AI" /></template>
      <TypingBubble />
    </Message>
  </MessageScroller>
</template>
