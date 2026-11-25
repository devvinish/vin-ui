<script lang="ts">
/*
 * VinUI · Code Block (Vue). API: spec/code-block.json.
 *   <CodeBlock :code="source" filename="app.vue" language="vue" line-numbers :highlight="[3, 4]" />
 * No syntax highlighter is bundled: pass plain `code`, or `html` that Shiki, Prism or the
 * vin-code-block__{keyword|string|number|comment} classes already highlighted.
 */
import { computed, onBeforeUnmount, ref } from "vue";

/** Dev-only warnings, without needing Node's `process` (Vite and the browser don't have it). */
const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";

/** Copy text, with a fallback for pages that aren't a secure context. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

const textOf = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** The code as plain text. */
  code?: string;
  /** Already-highlighted HTML, used instead of `code`. Only pass HTML you trust. */
  html?: string;
  /** File name, shown in the header. Or use the #filename slot. */
  filename?: string;
  /** Short language label, shown in the header. */
  language?: string;
  lineNumbers?: boolean;
  /** Lines to highlight, starting at 1. */
  highlight?: number[];
  /** Name of the copy button. Default: "Copy code". */
  copyLabel?: string;
  /** Show the copy button. Default true. */
  copyable?: boolean;
}>(), { copyLabel: "Copy code", copyable: true });
const slots = defineSlots<{ filename?(): unknown }>();

if (isDev() && props.code == null && props.html == null) console.warn("VinUI CodeBlock: pass `code` or `html`.");

const copied = ref(false);
const status = ref("");
let timer: number | undefined;
onBeforeUnmount(() => clearTimeout(timer));

const source = computed(() => (props.html ?? props.code ?? "").replace(/\n$/, ""));
const plain = computed(() => (props.html != null ? textOf(source.value) : source.value));
const byLine = computed(() => props.lineNumbers || (props.highlight?.length ?? 0) > 0);
const lines = computed(() => (byLine.value ? source.value.split("\n") : []));
const hasFile = computed(() => props.filename != null || !!slots.filename);
const header = computed(() => hasFile.value || props.language != null);
const gutter = computed(() => (props.lineNumbers && lines.value.length > 99 ? `${String(lines.value.length).length}ch` : undefined));
const lineClass = (i: number) => ["vin-code-block__line", props.highlight?.includes(i + 1) && "vin-code-block__line--highlight"];

async function onCopy() {
  const ok = await copyText(plain.value);
  clearTimeout(timer);
  copied.value = ok;
  status.value = ok ? "Copied" : "Couldn't copy";
  timer = window.setTimeout(() => { copied.value = false; status.value = ""; }, 2000);
}
</script>

<template>
  <div :class="['vin-code-block', lineNumbers && 'vin-code-block--numbered']" :style="gutter ? { '--vin-code-gutter': gutter } : undefined">
    <div v-if="header" class="vin-code-block__header">
      <span v-if="hasFile" class="vin-code-block__title"><slot name="filename">{{ filename }}</slot></span>
      <span v-if="language != null" class="vin-code-block__lang">{{ language }}</span>
      <button
        v-if="copyable"
        type="button"
        class="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-code-block__copy"
        :aria-label="copyLabel"
        :data-copied="copied ? '' : undefined"
        @click="onCopy"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      </button>
    </div>
    <button
      v-else-if="copyable"
      type="button"
      class="vin-btn vin-btn--ghost vin-btn--icon vin-btn--sm vin-code-block__copy"
      :aria-label="copyLabel"
      :data-copied="copied ? '' : undefined"
      @click="onCopy"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
    </button>
    <pre class="vin-code-block__pre" tabindex="0"><code v-if="byLine"><template v-for="(line, i) in lines" :key="i"><span v-if="html != null" :class="lineClass(i)" v-html="line" /><span v-else :class="lineClass(i)">{{ line }}</span></template></code><code v-else-if="html != null" v-html="source" /><code v-else>{{ source }}</code></pre>
    <span v-if="copyable" class="vin-code-block__status" role="status">{{ status }}</span>
  </div>
</template>
