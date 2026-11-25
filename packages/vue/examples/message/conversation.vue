<script setup lang="ts">
import Message, { MessageCopy, MessageFeedback } from "@/components/vin/message.vue";
import Avatar from "@/components/vin/avatar.vue";
import Bubble from "@/components/vin/bubble.vue";
</script>

<template>
  <div style="display: grid; gap: 20px; width: 100%; max-width: 560px">
    <Message align="end" author="You" time="10:41" date-time="2026-11-25T10:41">
      <template #avatar><Avatar name="Ada Lovelace" size="sm" src="/ui/avatars/ada.svg" /></template>
      <Bubble as="p" from="user">What does HTTP 429 mean?</Bubble>
    </Message>
    <Message author="Assistant" time="10:41" date-time="2026-11-25T10:41">
      <template #avatar><Avatar name="Assistant" size="sm" shape="square" fallback="AI" /></template>
      <p><strong>429 Too Many Requests</strong> means you sent more requests than the server allows. Wait for the time in the <code>Retry-After</code> header, then try again.</p>
      <template #actions>
        <MessageCopy />
        <MessageFeedback default-value="up" />
      </template>
    </Message>
  </div>
</template>
