<script setup lang="ts">
import Item from "@/components/vin/item.vue";
import Avatar from "@/components/vin/avatar.vue";
import Button from "@/components/vin/button.vue";

</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%; max-width: 420px">
    <Item variant="outline" title="Ada Lovelace" description="ada@example.com">
      <template #media><Avatar name="Ada Lovelace" src="/ui/avatars/ada.svg" /></template>
      <template #actions><Button variant="outline" size="sm">Invite</Button></template>
    </Item>
    <Item variant="muted" title="Two-step sign-in" description="Ask for a code when you sign in on a new device.">
      <template #media><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg></template>
      <template #actions><Button size="sm">Turn on</Button></template>
    </Item>
  </div>
</template>
