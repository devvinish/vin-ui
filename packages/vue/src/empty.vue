<script setup lang="ts">
/*
 * VinUI · Empty (Vue). API: spec/empty.json.
 * What to show when there's nothing yet, with the next step.
 *   <Empty title="No projects yet" description="…"><template #icon><svg … /></template><template #actions>…</template></Empty>
 */
withDefaults(defineProps<{
  variant?: "default" | "outline";
  /** Or use the #title slot. */
  title?: string;
  /** Tag for the title. Use h2/h3 when it heads a section. Default: p. */
  titleAs?: string;
  /** Or use the #description slot. */
  description?: string;
}>(), { variant: "default", titleAs: "p" });

const slots = defineSlots<{ default?(): unknown; icon?(): unknown; title?(): unknown; description?(): unknown; actions?(): unknown }>();
</script>

<template>
  <div :class="['vin-empty', variant === 'outline' && 'vin-empty--outline']">
    <div v-if="slots.icon" class="vin-empty__media"><slot name="icon" /></div>
    <component :is="titleAs" v-if="title != null || slots.title" class="vin-empty__title"><slot name="title">{{ title }}</slot></component>
    <p v-if="description != null || slots.description" class="vin-empty__description"><slot name="description">{{ description }}</slot></p>
    <slot />
    <div v-if="slots.actions" class="vin-empty__actions"><slot name="actions" /></div>
  </div>
</template>
