<script lang="ts">
/*
 * VinUI · Alert Dialog (Vue). API: spec/alert-dialog.json. Needs dialog.vue next to it.
 * Asks before something that can't be undone. Focus starts on Cancel; Escape cancels.
 *   <AlertDialog title="Delete this project?" action="Delete project" @action="remove">
 *     <template #trigger><Button variant="danger">Delete</Button></template>
 *   </AlertDialog>
 */
import Dialog from "./dialog.vue";
</script>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Or use the #title slot. */
  title?: string;
  /** Or use the #description slot. */
  description?: string;
  /** The confirm button's text. Default "Continue". */
  action?: string;
  /** The cancel button's text. Default "Cancel". */
  cancel?: string;
  /** The confirm button's look. Default "danger". */
  variant?: "default" | "danger";
  /** Show the built-in warning icon beside the title. Or use the #icon slot (an svg.vin-alert-dialog__icon). */
  icon?: boolean;
  /** Open or closed (v-model:open). */
  open?: boolean;
  /** Open at first, when you don't use v-model:open. */
  defaultOpen?: boolean;
}>(), { action: "Continue", cancel: "Cancel", variant: "danger", open: undefined });

const emit = defineEmits<{
  "update:open": [open: boolean];
  /** The user confirmed. */
  action: [];
  /** The user cancelled, with a button or Escape. */
  cancel: [];
}>();
const slots = defineSlots<{ trigger?(): unknown; title?(): unknown; description?(): unknown; icon?(): unknown }>();

function onClose(e: Event) {
  const d = e.currentTarget as HTMLDialogElement;
  if (d.returnValue === "action") emit("action"); else emit("cancel");
  d.returnValue = "";
}
</script>

<template>
  <Dialog
    role="alertdialog"
    class="vin-alert-dialog"
    :title="title"
    :description="description"
    :open="open"
    :default-open="defaultOpen"
    :dismissible="false"
    :show-close="false"
    footer-form
    @update:open="emit('update:open', $event)"
    @close="onClose"
  >
    <template v-if="slots.trigger" #trigger><slot name="trigger" /></template>
    <template v-if="slots.title" #title><slot name="title" /></template>
    <template v-if="slots.description" #description><slot name="description" /></template>
    <template v-if="slots.icon || icon" #icon>
      <slot name="icon">
        <svg class="vin-alert-dialog__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
      </slot>
    </template>
    <template #footer>
      <button type="submit" class="vin-btn vin-btn--outline" value="cancel" data-autofocus>{{ cancel }}</button>
      <button type="submit" :class="variant === 'danger' ? 'vin-btn vin-btn--danger' : 'vin-btn'" value="action">{{ action }}</button>
    </template>
  </Dialog>
</template>
