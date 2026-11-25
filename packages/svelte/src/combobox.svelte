<!--
  VinUI · Combobox (Svelte). API: spec/combobox.json.
  A text field that filters a list (WAI-ARIA combobox with list autocomplete). Focus stays in the
  input; the list opens in the top layer. Options use Select's classes, so they look the same.
    <Combobox label="Framework" options={["Astro", "SvelteKit"]} bind:value />
  Keys: ↓ ↑ PageUp PageDown to move, Enter to choose, Esc to close (and again to clear). bind:value works.
-->
<script lang="ts" module>
  export type ComboboxOption = string | { value: string; label: string; disabled?: boolean; group?: string };
  export type ComboboxItem = { value: string; label: string; disabled: boolean; group?: string };

  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const norm = (o: ComboboxOption): ComboboxItem => (typeof o === "string" ? { value: o, label: o, disabled: false } : { disabled: false, ...o });
  const defaultFilter = (o: ComboboxItem, q: string) => fold(o.label).includes(fold(q.trim()));
</script>

<script lang="ts">
  import { untrack, type Snippet } from "svelte";

  type Props = {
    options: ComboboxOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    /** Visible label. Without it, pass an aria-label. */
    label?: string | Snippet;
    "aria-label"?: string;
    placeholder?: string;
    /** Shown when nothing matches. */
    emptyText?: string | Snippet;
    /** Your own matching. The default matches any part of the label, ignoring case and accents. */
    filter?: (option: ComboboxItem, query: string) => boolean;
    hint?: string | Snippet;
    /** Error message. Also marks the field invalid. */
    error?: string | Snippet;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    /** Form field name: adds a hidden input with the value. */
    name?: string;
    id?: string;
    class?: string;
    style?: string;
  };
  let {
    options,
    value = $bindable(),
    onValueChange,
    label,
    "aria-label": ariaLabel,
    placeholder = "Search…",
    emptyText = "No results.",
    filter = defaultFilter,
    hint,
    error,
    size = "md",
    disabled = false,
    name,
    id,
    class: className,
    style,
  }: Props = $props();

  const uid = $props.id();
  const base = $derived(id ?? `vin-${uid}`);
  const ids = $derived({ list: `${base}-list`, hint: `${base}-hint`, error: `${base}-error` });
  const items = $derived(options.map(norm));
  const chosen = $derived(items.find((o) => o.value === value));
  const optionId = (i: number) => `${base}-opt-${i}`;

  const initialText = () => chosen?.label ?? "";
  let text = $state(initialText());
  let query = $state<string | null>(null); // null: not filtering, show everything
  let open = $state(false);
  let active = $state(-1);
  let input = $state<HTMLInputElement>();
  let panel = $state<HTMLDivElement>();

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label && !ariaLabel) console.warn("VinUI Combobox: pass a label or an aria-label.");
  };
  warnIfUnnamed();

  // Keep the text in step with a value changed from outside.
  $effect(() => {
    const l = chosen?.label ?? "";
    untrack(() => {
      if (query === null) text = l;
    });
  });

  const shown = $derived(items.map((o, i) => (query === null || filter(o, query) ? i : -1)).filter((i) => i >= 0));
  const enabled = $derived(shown.filter((i) => !items[i].disabled));

  function choose(i: number) {
    const o = items[i];
    if (!o || o.disabled) return;
    value = o.value;
    onValueChange?.(o.value);
    text = o.label;
    query = null;
  }
  function restore() {
    text = chosen?.label ?? "";
    query = null;
  }
  function close() {
    open = false;
    active = -1;
  }
  function openList(which?: "first" | "last" | "none", list = enabled) {
    if (disabled) return;
    const sel = items.findIndex((o) => o.value === value);
    active =
      which === "first"
        ? (list[0] ?? -1)
        : which === "last"
          ? (list[list.length - 1] ?? -1)
          : which === "none"
            ? -1
            : list.includes(sel)
              ? sel
              : (list[0] ?? -1);
    open = true;
  }

  // Show the popover, place it under (or above) the field, and close on outside press.
  $effect(() => {
    const el = panel,
      field = input;
    if (!open || !el || !field) return;
    el.showPopover?.();
    const place = () => {
      const r = field.getBoundingClientRect();
      el.style.minWidth = `${r.width}px`;
      el.style.left = `${r.left}px`;
      const below = window.innerHeight - r.bottom,
        h = el.offsetHeight;
      el.style.top = `${below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4}px`;
    };
    place();
    const outside = (e: PointerEvent) => {
      if (!field.contains(e.target as Node) && !el.contains(e.target as Node)) {
        close();
        restore();
      }
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", outside, true);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", outside, true);
      if (el.matches(":popover-open")) el.hidePopover?.();
    };
  });

  $effect(() => {
    if (open && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
  });

  function move(step: number) {
    const pos = enabled.indexOf(active);
    active = pos < 0 ? (enabled[step > 0 ? 0 : enabled.length - 1] ?? -1) : enabled[Math.min(enabled.length - 1, Math.max(0, pos + step))];
  }

  function onkeydown(e: KeyboardEvent) {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        const list = query === null ? items.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0) : enabled;
        openList(e.altKey ? "none" : k === "ArrowUp" ? "last" : undefined, list);
      } else if (!e.altKey) move(k === "ArrowDown" ? 1 : -1);
      return;
    }
    if (!open) {
      if (k === "Escape" && text) {
        e.preventDefault();
        value = undefined;
        onValueChange?.("");
        text = "";
        query = null;
      }
      return;
    }
    if (k === "PageDown" || k === "PageUp") {
      e.preventDefault();
      move(k === "PageDown" ? 10 : -10);
    } else if (k === "Enter") {
      e.preventDefault();
      if (active >= 0) choose(active);
      close();
    } else if (k === "Escape") {
      e.preventDefault();
      close();
      restore();
    } else if (k === "Tab") {
      if (active >= 0 && query !== null) choose(active);
      close();
    }
  }

  function oninput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    const q = e.currentTarget.value;
    text = q;
    query = q;
    const list = items.map((o, i) => (!o.disabled && filter(o, q) ? i : -1)).filter((i) => i >= 0);
    openList("first", list);
  }

  // Options in order; consecutive options with the same group go under one heading.
  const blocks = $derived.by(() => {
    const out: { group?: string; idx: number[] }[] = [];
    items.forEach((o, i) => {
      const last = out[out.length - 1];
      if (last && last.group === o.group) last.idx.push(i);
      else out.push({ group: o.group, idx: [i] });
    });
    return out;
  });
</script>

{#snippet textOf(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet option(i: number)}
  {@const o = items[i]}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_interactive_supports_focus (keys are handled on the input, which keeps focus) -->
  <div
    id={optionId(i)}
    class="vin-select__item"
    role="option"
    aria-selected={o.value === value}
    aria-disabled={o.disabled || undefined}
    data-value={o.value}
    data-active={open && i === active ? "" : undefined}
    hidden={!shown.includes(i) || undefined}
    onpointermove={() => {
      if (!o.disabled && i !== active) active = i;
    }}
    onclick={() => {
      if (o.disabled) return;
      choose(i);
      close();
      input?.focus();
    }}
  >
    {o.label}
  </div>
{/snippet}

{#snippet control()}
  <div class={["vin-combobox", !label && className].filter(Boolean).join(" ")} style={label ? undefined : style}>
    <input
      bind:this={input}
      id={base}
      class={["vin-input", "vin-combobox__input", size !== "md" && `vin-input--${size}`].filter(Boolean).join(" ")}
      type="text"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls={ids.list}
      aria-label={label ? undefined : ariaLabel}
      aria-invalid={error ? true : undefined}
      aria-describedby={[error && ids.error, hint && ids.hint].filter(Boolean).join(" ") || undefined}
      aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
      autocomplete="off"
      {placeholder}
      value={text}
      {disabled}
      {oninput}
      onclick={() => (open ? close() : openList())}
      {onkeydown}
      onblur={() =>
        setTimeout(() => {
          if (document.activeElement !== input) {
            close();
            restore();
          }
        }, 0)}
    />
    <!-- svelte-ignore a11y_no_static_element_interactions (mousedown only keeps focus in the input) -->
    <div bind:this={panel} class="vin-select__content vin-combobox__content" popover="manual" onmousedown={(e) => e.preventDefault()}>
      <div id={ids.list} role="listbox" aria-label={typeof label === "string" ? label : ariaLabel}>
        {#each blocks as b, n (n)}
          {#if b.group === undefined}
            {#each b.idx as i (i)}{@render option(i)}{/each}
          {:else}
            <div class="vin-combobox__group" role="group" aria-labelledby={`${base}-g${n}`} hidden={!b.idx.some((i) => shown.includes(i)) || undefined}>
              <div class="vin-combobox__label" id={`${base}-g${n}`} role="presentation">{b.group}</div>
              {#each b.idx as i (i)}{@render option(i)}{/each}
            </div>
          {/if}
        {/each}
      </div>
      <p class="vin-combobox__empty" role="status" hidden={shown.length > 0 || undefined}>{@render textOf(emptyText)}</p>
    </div>
    {#if name}<input type="hidden" {name} value={value ?? ""} />{/if}
  </div>
{/snippet}

{#if !label}
  {@render control()}
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <label class="vin-label" for={base}>{@render textOf(label)}</label>
    {@render control()}
    {#if error}<p class="vin-error" id={ids.error}>{@render textOf(error)}</p>{/if}
    {#if hint}<p class="vin-hint" id={ids.hint}>{@render textOf(hint)}</p>{/if}
  </div>
{/if}
