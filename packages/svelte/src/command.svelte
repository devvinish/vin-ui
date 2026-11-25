<!--
  VinUI · Command (Svelte). API: spec/command.json.
  A search box that filters a list of commands (WAI-ARIA combobox + listbox). Use it inline, or as a
  ⌘K palette with <CommandDialog> (command-dialog.svelte).
    <Command groups={[{ heading: "Pages", items: [{ value: "home", label: "Home" }] }]} onSelect={go} />
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type CommandItem = {
    value: string;
    label: string;
    icon?: Snippet;
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

  export type CommandProps = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    groups: CommandGroup[];
    /** Called with the chosen command's value. */
    onSelect?: (value: string) => void;
    placeholder?: string;
    emptyText?: string | Snippet;
    /** Name for the search box. Default "Search commands". */
    label?: string;
    /** Show key hints under the list. */
    footer?: boolean;
    /** Your own matching. The default needs every typed word in the label or keywords. */
    filter?: (item: CommandItem, query: string) => boolean;
    class?: string;
  };

  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const defaultFilter = (item: CommandItem, q: string) => {
    const hay = fold(`${item.label} ${item.keywords ?? ""}`);
    return fold(q)
      .split(/\s+/)
      .filter(Boolean)
      .every((w) => hay.includes(w));
  };
</script>

<script lang="ts">
  import { getContext } from "svelte";

  let {
    groups,
    onSelect,
    placeholder = "Type a command or search…",
    emptyText = "No results found.",
    label = "Search commands",
    footer = false,
    filter = defaultFilter,
    class: className,
    ...rest
  }: CommandProps = $props();

  const uid = $props.id();
  const base = `vin-cmd-${uid}`;
  const listId = `${base}-list`;
  /** Set by CommandDialog so choosing a command closes it, and opening it starts fresh. */
  const dialog = getContext<{ close: () => void; readonly openCount: number } | undefined>("vin-command-dialog");

  let query = $state("");
  let activeKey = $state<string | null>(null);
  let input = $state<HTMLInputElement>();

  const flat = $derived(groups.flatMap((g, gi) => g.items.map((item, ii) => ({ item, gi, key: `${gi}-${ii}` }))));
  const q = $derived(query.trim());
  const shown = $derived(flat.filter((x) => !q || filter(x.item, q)));
  const shownKeys = $derived(new Set(shown.map((x) => x.key)));
  const usable = $derived(shown.filter((x) => !x.item.disabled));
  const active = $derived(usable.find((x) => x.key === activeKey) ?? usable[0]);

  // A fresh start each time the palette opens.
  $effect(() => {
    if (!dialog) return;
    void dialog.openCount;
    query = "";
    activeKey = null;
    input?.focus();
  });

  $effect(() => {
    if (active) document.getElementById(`${base}-${active.key}`)?.scrollIntoView({ block: "nearest" });
  });

  function run(item: CommandItem | undefined) {
    if (!item || item.disabled) return;
    item.onSelect?.();
    onSelect?.(item.value);
    dialog?.close();
    if (item.href) window.location.href = item.href;
  }
  function move(step: number) {
    if (!usable.length) return;
    const i = active ? usable.indexOf(active) : -1;
    activeKey = usable[(i + step + usable.length) % usable.length].key;
  }
  function onkeydown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Home" && e.ctrlKey) {
      e.preventDefault();
      activeKey = usable[0]?.key ?? null;
    } else if (e.key === "End" && e.ctrlKey) {
      e.preventDefault();
      activeKey = usable[usable.length - 1]?.key ?? null;
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(active?.item);
    }
  }
</script>

{#snippet textOf(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<div {...rest} class={["vin-command", className].filter(Boolean).join(" ")}>
  <div class="vin-command__search">
    <svg class="vin-command__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
      ><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg
    >
    <input
      bind:this={input}
      class="vin-command__input"
      type="text"
      role="combobox"
      aria-expanded="true"
      aria-controls={listId}
      aria-autocomplete="list"
      aria-label={label}
      aria-activedescendant={active ? `${base}-${active.key}` : undefined}
      {placeholder}
      autocomplete="off"
      spellcheck={false}
      value={query}
      oninput={(e) => {
        query = e.currentTarget.value;
        activeKey = null;
      }}
      {onkeydown}
    />
  </div>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_interactive_supports_focus (mousedown only keeps focus in the search box) -->
  <div class="vin-command__list" id={listId} role="listbox" aria-label="Commands" onmousedown={(e) => e.preventDefault()}>
    {#each groups as g, gi (gi)}
      {#if gi > 0}<div class="vin-command__separator" role="presentation" hidden={!!q || undefined}></div>{/if}
      <div
        class="vin-command__group"
        role="group"
        aria-labelledby={g.heading ? `${base}-g${gi}` : undefined}
        hidden={!shown.some((x) => x.gi === gi) || undefined}
      >
        {#if g.heading}<div class="vin-command__label" id={`${base}-g${gi}`} role="presentation">{g.heading}</div>{/if}
        {#each g.items as item, ii (ii)}
          {@const key = `${gi}-${ii}`}
          {@const on = active?.key === key}
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_interactive_supports_focus (keys are handled on the search box, which keeps focus) -->
          <div
            id={`${base}-${key}`}
            class="vin-command__item"
            role="option"
            aria-selected={on}
            aria-disabled={item.disabled || undefined}
            data-value={item.value}
            data-active={on ? "" : undefined}
            hidden={!shownKeys.has(key) || undefined}
            onpointermove={() => {
              if (!item.disabled && !on) activeKey = key;
            }}
            onclick={() => run(item)}
          >
            {@render item.icon?.()}{item.label}
            {#if item.shortcut}<span class="vin-command__shortcut" aria-hidden="true">{item.shortcut}</span>{/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <p class="vin-command__empty" role="status" hidden={shown.length > 0 || undefined}>{@render textOf(emptyText)}</p>
  {#if footer}
    <div class="vin-command__footer" aria-hidden="true">
      <span><kbd class="vin-kbd">↑</kbd><kbd class="vin-kbd">↓</kbd> to move</span>
      <span><kbd class="vin-kbd">↵</kbd> to open</span>
      <span><kbd class="vin-kbd">Esc</kbd> to close</span>
    </div>
  {/if}
</div>
