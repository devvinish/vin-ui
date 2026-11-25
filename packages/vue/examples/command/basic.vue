<script setup lang="ts">
import Command, { type CommandGroup } from "@/components/vin/command.vue";

const groups: CommandGroup[] = [
  {
    heading: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar" },
      { value: "emoji", label: "Search emoji", keywords: "smiley face" },
      { value: "calculator", label: "Calculator", disabled: true },
    ],
  },
  {
    heading: "Settings",
    items: [
      { value: "profile", label: "Profile", shortcut: "⌘P" },
      { value: "billing", label: "Billing", shortcut: "⌘B", keywords: "payment invoice plan" },
      { value: "settings", label: "Settings", shortcut: "⌘S", keywords: "preferences" },
    ],
  },
];
const onSelect = (value: string) => console.log(value);
</script>

<template>
  <div style="width: 100%; max-width: 440px">
    <Command :groups="groups" @select="onSelect">
      <template #icon="{ item }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <template v-if="item.value === 'calendar'"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></template>
          <template v-else-if="item.value === 'emoji'"><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01M15 9h.01" /></template>
          <template v-else-if="item.value === 'calculator'"><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18.5h8" /></template>
          <template v-else-if="item.value === 'profile'"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></template>
          <template v-else-if="item.value === 'billing'"><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19" /></template>
          <template v-else><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></template>
        </svg>
      </template>
    </Command>
  </div>
</template>
