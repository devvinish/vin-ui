<script lang="ts">
/*
 * VinUI · Attachment (Vue). API: spec/attachment.json.
 * A file or picture attached to a message: icon or thumbnail, name, size and type,
 * an optional remove button, upload progress and an error state.
 *   import Attachment, { AttachmentList } from "@/components/vin/attachment.vue";
 *   <AttachmentList label="Attached files"><Attachment name="brief.pdf" type="PDF" :size="2516582" @remove="drop" /></AttachmentList>
 * @remove and @retry show their buttons only when you listen for them.
 */
import { Comment, Fragment, computed, defineComponent, h, type VNode } from "vue";

/** 2516582 → "2.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let n = bytes / 1024, i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${i === 0 || n >= 100 ? Math.round(n) : Number(n.toFixed(1))} ${units[i]}`;
}

function flatten(nodes: VNode[] | undefined): VNode[] {
  return (nodes ?? []).flatMap((n) => (n.type === Fragment ? flatten(n.children as VNode[]) : n.type === Comment ? [] : [n]));
}

/** A wrapping row of attachments. Each child becomes a list item. */
export const AttachmentList = defineComponent({
  name: "AttachmentList",
  props: {
    /** Name for the list, e.g. "Attached files". */
    label: { type: String, default: undefined },
  },
  setup: (props, { slots }) => () =>
    h("ul", { "aria-label": props.label, class: "vin-attachment-list" }, flatten(slots.default?.()).map((n) => h("li", null, [n]))),
});
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** The file name. It is also the picture's alt text and part of the button labels. */
  name: string;
  /** Short type label, e.g. "PDF". */
  type?: string;
  /** Size in bytes, shown as "2.4 MB". */
  size?: number;
  /** Your own line under the name. Replaces type and size. Or use the #meta slot. */
  meta?: string;
  /** "image" draws a square picture tile. Default: "file". */
  variant?: "file" | "image";
  /** A picture: the thumbnail in a file row, or the whole tile. */
  thumbnail?: string;
  /** Makes it a link, e.g. to download a file that was sent. */
  href?: string;
  download?: boolean | string;
  /** Upload progress, 0–100. Shows a progress bar while it's set. */
  progress?: number;
  /** The upload failed: the message to show. */
  error?: string;
  /** Listening for @remove shows a remove button (cancel while uploading). */
  onRemove?: () => void;
  /** With error, listening for @retry shows a retry button. */
  onRetry?: () => void;
}>(), { variant: "file", download: undefined });
const slots = defineSlots<{ meta?(): unknown; icon?(): unknown }>();

const uploading = computed(() => props.progress != null && props.error == null);
const pct = computed(() => (uploading.value ? Math.round(Math.min(100, Math.max(0, props.progress!))) : 0));
const tag = computed(() => (props.href ? "a" : "div"));
const link = computed(() => (props.href ? { href: props.href, download: props.download } : {}));
const classes = computed(() => ["vin-attachment", props.variant === "image" && "vin-attachment--image", props.error != null && "vin-attachment--error"]);
const fallback = computed(() => [props.type, props.size != null && formatBytes(props.size)].filter(Boolean).join(" · ") || null);
const line = computed(() => props.error ?? (uploading.value ? `Uploading… ${pct.value}%` : props.meta ?? fallback.value));
const showMeta = computed(() => line.value != null || (!!slots.meta && props.error == null && !uploading.value));
</script>

<template>
  <component :is="tag" v-if="variant === 'image'" v-bind="link" :class="classes">
    <img class="vin-attachment__thumb" :src="thumbnail" :alt="name" />
    <button v-if="onRemove" type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-attachment__action" :aria-label="uploading ? `Cancel upload of ${name}` : `Remove ${name}`" @click="onRemove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    </button>
  </component>
  <component :is="tag" v-else v-bind="link" :class="classes">
    <img v-if="thumbnail" class="vin-attachment__thumb" :src="thumbnail" alt="" />
    <span v-else class="vin-attachment__icon">
      <slot name="icon">
        <svg v-if="error != null" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M12 11v3.5" /><path d="M12 17.5h.01" /></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
      </slot>
    </span>
    <span class="vin-attachment__body">
      <span class="vin-attachment__name">{{ name }}</span>
      <span v-if="showMeta" class="vin-attachment__meta"><slot v-if="error == null && !uploading && meta == null" name="meta">{{ line }}</slot><template v-else>{{ line }}</template></span>
      <span
        v-if="uploading"
        class="vin-progress vin-progress--sm"
        role="progressbar"
        :aria-label="`Uploading ${name}`"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="pct"
        :style="{ '--vin-value': `${pct}%` }"
      />
    </span>
    <button v-if="error != null && onRetry" type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-attachment__action" :aria-label="`Retry ${name}`" @click="onRetry()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
    </button>
    <button v-if="onRemove" type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-attachment__action" :aria-label="uploading ? `Cancel upload of ${name}` : `Remove ${name}`" @click="onRemove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    </button>
  </component>
</template>
