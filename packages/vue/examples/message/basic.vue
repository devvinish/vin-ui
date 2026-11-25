<script setup lang="ts">
import Message, { MessageAction, MessageCopy, MessageFeedback } from "@/components/vin/message.vue";
import Avatar from "@/components/vin/avatar.vue";
</script>

<template>
  <Message style="max-width: 560px" author="Assistant" time="10:42" date-time="2026-11-25T10:42">
    <template #avatar><Avatar name="Assistant" size="sm" shape="square" fallback="AI" /></template>
    <p>Here are three ways to speed up your build:</p>
    <ul>
      <li>Cache <code>node_modules</code> between runs.</li>
      <li>Run the tests in parallel.</li>
      <li>Only rebuild the packages that changed.</li>
    </ul>
    <template #actions>
      <MessageCopy />
      <MessageAction label="Retry">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
      </MessageAction>
      <MessageFeedback />
    </template>
  </Message>
</template>
