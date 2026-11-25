<script setup lang="ts">
import Bubble, { BubbleGroup } from "@/components/vin/bubble.vue";
</script>

<template>
  <BubbleGroup style="width: 100%; max-width: 460px">
    <Bubble as="p">Your order has shipped. It should arrive on Thursday.</Bubble>
    <Bubble as="p" from="user" solid>Great, thanks!</Bubble>
    <Bubble as="p" from="user" solid>Can I change the delivery address?</Bubble>
  </BubbleGroup>
</template>
