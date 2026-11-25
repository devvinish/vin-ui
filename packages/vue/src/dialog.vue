<script lang="ts">
/*
 * VinUI · Dialog (Vue). API: spec/dialog.json.
 * The browser's modal <dialog>: it traps focus, Escape closes it, focus returns to the trigger.
 *   import Dialog, { DialogClose } from "@/components/vin/dialog.vue";
 *   <Dialog title="Edit profile">
 *     <template #trigger><Button>Edit profile</Button></template>
 *     …
 *     <template #footer><DialogClose><Button>Done</Button></DialogClose></template>
 *   </Dialog>
 */
import {
  Comment, Fragment, Text, cloneVNode, computed, defineComponent, inject, onMounted, provide, ref, useAttrs, useId, watch,
  type FunctionalComponent, type InjectionKey, type VNode,
} from "vue";

const CloseKey: InjectionKey<() => void> = Symbol("VinDialogClose");

/** The first real node of a slot (skipping comments, blank text and fragments). */
function firstNode(nodes: VNode[] | undefined): VNode | undefined {
  for (const n of nodes ?? []) {
    if (n.type === Comment || (n.type === Text && !String(n.children).trim())) continue;
    if (n.type === Fragment) { const f = firstNode(n.children as VNode[]); if (f) return f; continue; }
    return n;
  }
}

/** Makes its child button close the dialog it's in. */
export const DialogClose = defineComponent({
  name: "DialogClose",
  setup(_, { slots }) {
    const close = inject(CloseKey, () => {});
    return () => {
      const n = firstNode(slots.default?.());
      return n ? cloneVNode(n, { onClick: (e: MouseEvent) => { if (!e.defaultPrevented) close(); } }) : null;
    };
  },
});
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Or use the #title slot. */
  title?: string;
  /** Or use the #description slot. */
  description?: string;
  /** Open or closed (v-model:open). */
  open?: boolean;
  /** Open at first, when you don't use v-model:open. */
  defaultOpen?: boolean;
  /** Listening to @submit wraps the body and footer in a form. A submit button sends it and closes the dialog. */
  onSubmit?: (data: FormData, event: SubmitEvent) => void;
  /** Close on a click outside. Default true. */
  dismissible?: boolean;
  /** Show the X button. Default true. */
  showClose?: boolean;
  /** Label for the X button. Default "Close". */
  closeLabel?: string;
  /** Make the footer a form[method=dialog]: a submit button in it closes the dialog and sets returnValue to its value. */
  footerForm?: boolean;
}>(), { open: undefined, dismissible: true, showClose: true, closeLabel: "Close" });

const emit = defineEmits<{ "update:open": [open: boolean] }>();
const slots = defineSlots<{
  default?(): unknown;
  /** The button that opens it. */
  trigger?(): VNode[];
  title?(): unknown;
  description?(): unknown;
  /** Actions at the end. Wrap a button in <DialogClose> to make it close the dialog. */
  footer?(): unknown;
  /** An icon before the title (Alert Dialog uses it for a warning). */
  icon?(): unknown;
}>();
const attrs = useAttrs() as Record<string, any>;

const id = "vin-dlg-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
const el = ref<HTMLDialogElement | null>(null);
const inner = ref(props.defaultOpen);
const isOpen = computed(() => props.open ?? inner.value);
const hasDesc = computed(() => props.description != null || !!slots.description);
const setOpen = (v: boolean) => { inner.value = v; emit("update:open", v); };
const close = () => el.value?.close();
provide(CloseKey, close);
defineExpose({ close });

// Open or close the native dialog to match the state.
function sync() {
  const d = el.value;
  if (!d?.showModal) return;
  // Focus starts on the first field; put data-autofocus on something else to start there.
  if (isOpen.value && !d.open) { d.showModal(); d.querySelector<HTMLElement>("[data-autofocus]")?.focus(); }
  if (!isOpen.value && d.open) d.close();
}
onMounted(sync);
watch(isOpen, sync, { flush: "post" });

function onClose() {
  if (isOpen.value) setOpen(false);
}
function onClick(e: MouseEvent) {
  if (!props.dismissible || e.target !== e.currentTarget) return;
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
}
function onFormSubmit(e: Event) {
  props.onSubmit?.(new FormData(e.currentTarget as HTMLFormElement), e as SubmitEvent);
}

const Trigger: FunctionalComponent = () => {
  const n = firstNode(slots.trigger?.());
  return n ? cloneVNode(n, { "aria-haspopup": "dialog", onClick: (e: MouseEvent) => { if (!e.defaultPrevented) setOpen(true); } }) : null;
};
</script>

<template>
  <Trigger />
  <dialog
    ref="el"
    v-bind="attrs"
    :id="attrs.id ?? id"
    class="vin-dialog"
    :aria-labelledby="`${id}-title`"
    :aria-describedby="hasDesc ? `${id}-desc` : undefined"
    @close="onClose"
    @click="onClick"
  >
    <div class="vin-dialog__header">
      <slot name="icon" />
      <h2 class="vin-dialog__title" :id="`${id}-title`"><slot name="title">{{ title }}</slot></h2>
      <p v-if="hasDesc" class="vin-dialog__description" :id="`${id}-desc`"><slot name="description">{{ description }}</slot></p>
    </div>
    <form v-if="onSubmit" method="dialog" @submit="onFormSubmit">
      <div v-if="slots.default" class="vin-dialog__body"><slot /></div>
      <template v-if="slots.footer">
        <form v-if="footerForm" method="dialog" class="vin-dialog__footer"><slot name="footer" /></form>
        <div v-else class="vin-dialog__footer"><slot name="footer" /></div>
      </template>
    </form>
    <template v-else>
      <div v-if="slots.default" class="vin-dialog__body"><slot /></div>
      <template v-if="slots.footer">
        <form v-if="footerForm" method="dialog" class="vin-dialog__footer"><slot name="footer" /></form>
        <div v-else class="vin-dialog__footer"><slot name="footer" /></div>
      </template>
    </template>
    <button v-if="showClose" type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-dialog__close" :aria-label="closeLabel" @click="close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    </button>
  </dialog>
</template>
