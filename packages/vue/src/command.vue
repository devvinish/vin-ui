<script lang="ts">
/*
 * VinUI · Command (Vue). API: spec/command.json.
 * A search box that filters a list of commands (WAI-ARIA combobox + listbox). Use it inline, or as a
 * ⌘K palette with <CommandDialog>.
 *   <Command :groups="[{ heading: 'Pages', items: [{ value: 'home', label: 'Home' }] }]" @select="go" />
 *   <CommandDialog :groups="groups" @select="go"><template #trigger><Button>Search…</Button></template></CommandDialog>
 * Icons: give an item an `icon` (a component or VNode), or use the #icon="{ item }" slot.
 */
import {
  Comment, Fragment, Text, cloneVNode, computed, defineComponent, h, inject, nextTick, onBeforeUnmount, onMounted,
  provide, ref, useId, watch,
  type Component, type InjectionKey, type PropType, type Ref, type SlotsType, type VNode,
} from "vue";

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export type CommandItem = {
  value: string;
  label: string;
  icon?: Component | VNode;
  /** Shown at the end, e.g. "⌘P". Hidden from screen readers. */
  shortcut?: string;
  /** Extra words that match, e.g. "payment invoice" for Billing. */
  keywords?: string;
  /** Go to this page when chosen. */
  href?: string;
  disabled?: boolean;
  onSelect?: () => void;
};
export type CommandGroup = { heading?: string; items: CommandItem[] };

const defaultFilter = (item: CommandItem, q: string) => {
  const hay = fold(`${item.label} ${item.keywords ?? ""}`);
  return fold(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

/** Set by CommandDialog so choosing a command closes it, and opening it starts fresh. */
const DialogKey: InjectionKey<{ close: () => void; openCount: Ref<number> }> = Symbol("VinCommandDialog");

const commandProps = {
  groups: { type: Array as PropType<CommandGroup[]>, required: true as const },
  placeholder: { type: String, default: "Type a command or search…" },
  /** Shown when nothing matches. Or use the #empty slot. */
  emptyText: { type: String, default: "No results found." },
  /** Name for the search box. Default "Search commands". */
  label: { type: String, default: "Search commands" },
  /** Show key hints under the list. */
  footer: { type: Boolean, default: false },
  /** Your own matching. The default needs every typed word in the label or keywords. */
  filter: { type: Function as PropType<(item: CommandItem, query: string) => boolean>, default: undefined },
};
type CommandSlots = SlotsType<{ icon: { item: CommandItem }; empty: Record<string, never> }>;

const Command = defineComponent({
  name: "Command",
  props: commandProps,
  emits: { /** The chosen command's value. */ select: (_value: string) => true },
  slots: Object as CommandSlots,
  setup(props, { emit }) {
    const base = "vin-cmd-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const dialog = inject(DialogKey, null);
    const query = ref("");
    const input = ref<HTMLInputElement | null>(null);
    const flat = computed(() => props.groups.flatMap((g, gi) => g.items.map((item, ii) => ({ item, gi, key: `${gi}-${ii}` }))));
    const q = computed(() => query.value.trim());
    const shown = computed(() => flat.value.filter((x) => !q.value || (props.filter ?? defaultFilter)(x.item, q.value)));
    const usable = computed(() => shown.value.filter((x) => !x.item.disabled));
    const activeKey = ref<string | null>(null);
    const active = computed(() => usable.value.find((x) => x.key === activeKey.value) ?? usable.value[0]);
    const isShown = (key: string) => shown.value.some((x) => x.key === key);
    const groupShown = (gi: number) => shown.value.some((x) => x.gi === gi);

    // A fresh start each time the palette opens.
    if (dialog) {
      watch(dialog.openCount, () => {
        query.value = ""; activeKey.value = null;
        nextTick(() => input.value?.focus());
      }, { immediate: true });
    }
    watch(() => active.value?.key, (key) => {
      if (key) nextTick(() => document.getElementById(`${base}-${key}`)?.scrollIntoView?.({ block: "nearest" }));
    });

    function run(item: CommandItem | undefined) {
      if (!item || item.disabled) return;
      item.onSelect?.();
      emit("select", item.value);
      dialog?.close();
      if (item.href) window.location.href = item.href;
    }
    function move(step: number) {
      const u = usable.value;
      if (!u.length) return;
      const i = active.value ? u.indexOf(active.value) : -1;
      activeKey.value = u[(i + step + u.length) % u.length].key;
    }
    function onKeydown(e: KeyboardEvent) {
      const u = usable.value;
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Home" && e.ctrlKey) { e.preventDefault(); activeKey.value = u[0]?.key ?? null; }
      else if (e.key === "End" && e.ctrlKey) { e.preventDefault(); activeKey.value = u[u.length - 1]?.key ?? null; }
      else if (e.key === "Enter") { e.preventDefault(); run(active.value?.item); }
    }
    function onInput(e: Event) { query.value = (e.target as HTMLInputElement).value; activeKey.value = null; }
    function onItemMove(item: CommandItem, key: string) { if (!item.disabled && active.value?.key !== key) activeKey.value = key; }

    return { base, listId: `${base}-list`, query, input, q, shown, active, isShown, groupShown, run, onKeydown, onInput, onItemMove };
  },
});
export default Command;

/** The first real node of a slot (skipping comments, blank text and fragments). */
function firstNode(nodes: VNode[] | undefined): VNode | undefined {
  for (const n of nodes ?? []) {
    if (n.type === Comment || (n.type === Text && !String(n.children).trim())) continue;
    if (n.type === Fragment) { const f = firstNode(n.children as VNode[]); if (f) return f; continue; }
    return n;
  }
}

/** The ⌘K palette: Command in a modal dialog near the top of the screen. Takes every Command prop and slot. */
export const CommandDialog = defineComponent({
  name: "CommandDialog",
  inheritAttrs: false,
  props: {
    ...commandProps,
    /** Open or closed (v-model:open). */
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    /** ⌘ / Ctrl + this key toggles it. Default "k"; pass null for none. */
    shortcut: { type: String as PropType<string | null>, default: "k" },
    /** Name for the dialog. Default "Command menu". */
    title: { type: String, default: "Command menu" },
  },
  emits: { "update:open": (_open: boolean) => true, select: (_value: string) => true },
  slots: Object as SlotsType<{ trigger: Record<string, never>; icon: { item: CommandItem }; empty: Record<string, never> }>,
  setup(props, { emit, slots, attrs }) {
    const el = ref<HTMLDialogElement | null>(null);
    const inner = ref(props.defaultOpen);
    const isOpen = computed(() => props.open ?? inner.value);
    const openCount = ref(0);
    const setOpen = (v: boolean) => { inner.value = v; emit("update:open", v); };
    provide(DialogKey, { close: () => el.value?.close(), openCount });

    function sync() {
      const d = el.value;
      if (!d?.showModal) return;
      if (isOpen.value && !d.open) { d.showModal(); openCount.value++; }
      if (!isOpen.value && d.open) d.close();
    }
    onMounted(sync);
    watch(isOpen, sync, { flush: "post" });

    const onKey = (e: KeyboardEvent) => {
      const k = props.shortcut;
      if (!k || !(e.metaKey || e.ctrlKey) || e.altKey || e.key.toLowerCase() !== k.toLowerCase()) return;
      e.preventDefault();
      // Never on top of another dialog.
      if (el.value?.open) setOpen(false);
      else if (!document.querySelector("dialog[open]")) setOpen(true);
    };
    onMounted(() => document.addEventListener("keydown", onKey));
    onBeforeUnmount(() => document.removeEventListener("keydown", onKey));

    return () => {
      const t = firstNode(slots.trigger?.({}) as VNode[] | undefined);
      const k = props.shortcut?.toUpperCase();
      const { open: _o, defaultOpen: _d, shortcut: _s, title, ...command } = props;
      return [
        t && cloneVNode(t, {
          "aria-haspopup": "dialog",
          "aria-keyshortcuts": k ? `Meta+${k} Control+${k}` : undefined,
          onClick: (e: MouseEvent) => { if (!e.defaultPrevented) setOpen(true); },
        }, true),
        h("dialog", {
          ref: el,
          class: "vin-dialog vin-command-dialog",
          "aria-label": title,
          onClose: () => { if (isOpen.value) setOpen(false); },
          onClick: (e: MouseEvent) => {
            const d = e.currentTarget as HTMLDialogElement;
            if (e.target !== d) return;
            const r = d.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
          },
        }, h(Command, { ...attrs, ...command, onSelect: (v: string) => emit("select", v) }, { icon: slots.icon, empty: slots.empty })),
      ];
    };
  },
});
</script>

<template>
  <div class="vin-command">
    <div class="vin-command__search">
      <svg class="vin-command__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref="input"
        class="vin-command__input"
        type="text"
        role="combobox"
        aria-expanded="true"
        :aria-controls="listId"
        aria-autocomplete="list"
        :aria-label="label"
        :aria-activedescendant="active ? `${base}-${active.key}` : undefined"
        :placeholder="placeholder"
        autocomplete="off"
        spellcheck="false"
        :value="query"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>
    <div class="vin-command__list" :id="listId" role="listbox" aria-label="Commands" @mousedown.prevent>
      <template v-for="(g, gi) in groups" :key="gi">
        <div v-if="gi > 0" class="vin-command__separator" role="presentation" :hidden="!!q || undefined" />
        <div class="vin-command__group" role="group" :aria-labelledby="g.heading ? `${base}-g${gi}` : undefined" :hidden="!groupShown(gi) || undefined">
          <div v-if="g.heading" class="vin-command__label" :id="`${base}-g${gi}`" role="presentation">{{ g.heading }}</div>
          <div
            v-for="(item, ii) in g.items"
            :key="`${gi}-${ii}`"
            :id="`${base}-${gi}-${ii}`"
            class="vin-command__item"
            role="option"
            :aria-selected="active?.key === `${gi}-${ii}`"
            :aria-disabled="item.disabled || undefined"
            :data-value="item.value"
            :data-active="active?.key === `${gi}-${ii}` ? '' : undefined"
            :hidden="!isShown(`${gi}-${ii}`) || undefined"
            @pointermove="onItemMove(item, `${gi}-${ii}`)"
            @click="run(item)"
          >
            <slot name="icon" :item="item"><component :is="item.icon" v-if="item.icon" /></slot>{{ item.label }}
            <span v-if="item.shortcut" class="vin-command__shortcut" aria-hidden="true">{{ item.shortcut }}</span>
          </div>
        </div>
      </template>
    </div>
    <p class="vin-command__empty" role="status" :hidden="shown.length > 0 || undefined"><slot name="empty">{{ emptyText }}</slot></p>
    <div v-if="footer" class="vin-command__footer" aria-hidden="true">
      <span><kbd class="vin-kbd">↑</kbd><kbd class="vin-kbd">↓</kbd> to move</span>
      <span><kbd class="vin-kbd">↵</kbd> to open</span>
      <span><kbd class="vin-kbd">Esc</kbd> to close</span>
    </div>
  </div>
</template>
