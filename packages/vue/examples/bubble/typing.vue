<script setup lang="ts">
import Bubble, { BubbleGroup, TypingBubble } from "@/components/vin/bubble.vue";
</script>

<template>
  <BubbleGroup style="width: 100%; max-width: 460px">
    <Bubble as="p" from="user">Summarise this thread for me.</Bubble>
    <TypingBubble />
  </BubbleGroup>
</template>
