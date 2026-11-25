<!--
  VinUI · Select (Svelte). API: spec/select.json.
  A custom select (WAI-ARIA select-only combobox). Focus stays on the button; the list opens in
  the top layer, so parents with overflow: hidden never clip it. bind:value works.
  Keys: ↑ ↓ Home End PageUp PageDown, Enter/Space to choose, Esc to close, type to jump.
-->
<script lang="ts" module>
  export type SelectOption = string | { value: string; label: string; disabled?: boolean };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    options: SelectOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    /** Visible label. Without it, pass an aria-label. */
    label?: string | Snippet;
    "aria-label"?: string;
    placeholder?: string;
    hint?: string | Snippet;
    /** Error message. Also marks the select invalid. */
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
    placeholder = "Select…",
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
  const ids = $derived({ label: `${base}-label`, list: `${base}-list`, hint: `${base}-hint`, error: `${base}-error` });
  const items = $derived(options.map((o) => (typeof o === "string" ? { value: o, label: o, disabled: false } : { ...o, disabled: !!o.disabled })));
  const enabled = $derived(items.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0));
  const chosen = $derived(items.find((o) => o.value === value));
  const optionId = (i: number) => `${base}-opt-${i}`;

  let open = $state(false);
  let active = $state(-1);
  let trigger = $state<HTMLButtonElement>();
  let list = $state<HTMLDivElement>();
  const typed = { text: "", at: 0 };

  const isDev = () => (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production";
  const warnIfUnnamed = () => {
    if (isDev() && !label && !ariaLabel) console.warn("VinUI Select: pass a label or an aria-label.");
  };
  warnIfUnnamed();

  function choose(i: number) {
    const o = items[i];
    if (!o || o.disabled) return;
    value = o.value;
    onValueChange?.(o.value);
  }
  function openList(which?: "first" | "last") {
    if (disabled) return;
    const sel = items.findIndex((o) => o.value === value);
    active = which === "first" ? enabled[0] : which === "last" ? enabled[enabled.length - 1] : sel >= 0 && !items[sel].disabled ? sel : enabled[0];
    open = true;
  }
  function close() {
    open = false;
    active = -1;
  }

  // Show the popover, place it under (or above) the button, and close on outside press.
  $effect(() => {
    const el = list,
      btn = trigger;
    if (!open || !el || !btn) return;
    el.showPopover?.();
    const place = () => {
      const r = btn.getBoundingClientRect();
      el.style.minWidth = `${r.width}px`;
      el.style.left = `${r.left}px`;
      const below = window.innerHeight - r.bottom,
        h = el.offsetHeight;
      el.style.top = `${below < h + 8 && r.top > below ? r.top - h - 4 : r.bottom + 4}px`;
    };
    place();
    const outside = (e: PointerEvent) => {
      if (!btn.contains(e.target as Node) && !el.contains(e.target as Node)) close();
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
    if (open && active >= 0) list?.children[active]?.scrollIntoView({ block: "nearest" });
  });

  function move(stepBy: number) {
    const pos = enabled.indexOf(active);
    active = enabled[Math.min(enabled.length - 1, Math.max(0, pos + stepBy))];
  }
  function typeahead(ch: string) {
    const now = Date.now();
    typed.text = now - typed.at > 600 ? ch : typed.text + ch;
    typed.at = now;
    const from = open ? active : items.findIndex((o) => o.value === value);
    const start = enabled.indexOf(from) + (typed.text.length === 1 ? 1 : 0);
    const order = [...enabled.slice(start), ...enabled.slice(0, start)];
    const hit = order.find((i) => items[i].label.toLowerCase().startsWith(typed.text.toLowerCase()));
    if (hit === undefined) return;
    if (open) active = hit;
    else choose(hit);
  }

  function onkeydown(e: KeyboardEvent) {
    const k = e.key;
    const printable = k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(k)) {
        e.preventDefault();
        openList();
      } else if (k === "Home") {
        e.preventDefault();
        openList("first");
      } else if (k === "End") {
        e.preventDefault();
        openList("last");
      } else if (printable) typeahead(k);
      return;
    }
    if (k === "ArrowDown") {
      e.preventDefault();
      if (!e.altKey) move(1);
    } else if (k === "ArrowUp") {
      e.preventDefault();
      if (e.altKey) {
        choose(active);
        close();
      } else move(-1);
    } else if (k === "Home") {
      e.preventDefault();
      active = enabled[0];
    } else if (k === "End") {
      e.preventDefault();
      active = enabled[enabled.length - 1];
    } else if (k === "PageDown") {
      e.preventDefault();
      move(10);
    } else if (k === "PageUp") {
      e.preventDefault();
      move(-10);
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      choose(active);
      close();
    } else if (k === "Escape") {
      e.preventDefault();
      close();
    } else if (k === "Tab") {
      choose(active);
      close();
    } else if (printable) typeahead(k);
  }
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet control()}
  <div class={["vin-select", !label && className].filter(Boolean).join(" ")} style={label ? undefined : style}>
    <button
      bind:this={trigger}
      type="button"
      id={base}
      role="combobox"
      class={["vin-input", "vin-select__trigger", size !== "md" && `vin-input--${size}`].filter(Boolean).join(" ")}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={ids.list}
      aria-labelledby={label ? ids.label : undefined}
      aria-label={label ? undefined : ariaLabel}
      aria-invalid={error ? true : undefined}
      aria-describedby={[error && ids.error, hint && ids.hint].filter(Boolean).join(" ") || undefined}
      aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
      {disabled}
      onclick={() => (open ? close() : openList())}
      {onkeydown}
      onblur={() =>
        setTimeout(() => {
          if (document.activeElement !== trigger) close();
        }, 0)}
    >
      {#if chosen}<span class="vin-select__value">{chosen.label}</span>{:else}<span class="vin-select__value" data-placeholder="">{placeholder}</span>{/if}
    </button>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions (mousedown only keeps focus on the button) -->
    <div
      bind:this={list}
      class="vin-select__content"
      role="listbox"
      id={ids.list}
      popover="manual"
      tabindex="-1"
      aria-labelledby={label ? ids.label : undefined}
      aria-label={label ? undefined : ariaLabel}
      onmousedown={(e) => e.preventDefault()}
    >
      {#each items as o, i (o.value)}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_interactive_supports_focus (keys are handled on the combobox button, which keeps focus) -->
        <div
          id={optionId(i)}
          class="vin-select__item"
          role="option"
          aria-selected={o.value === value}
          aria-disabled={o.disabled || undefined}
          data-value={o.value}
          data-active={open && i === active ? "" : undefined}
          onpointermove={() => {
            if (!o.disabled && i !== active) active = i;
          }}
          onclick={() => {
            if (o.disabled) return;
            choose(i);
            close();
            trigger?.focus();
          }}
        >
          {o.label}
        </div>
      {/each}
    </div>
    {#if name}<input type="hidden" {name} value={value ?? ""} />{/if}
  </div>
{/snippet}

{#if !label}
  {@render control()}
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style}>
    <span class="vin-label" id={ids.label}>{@render text(label)}</span>
    {@render control()}
    {#if error}<p class="vin-error" id={ids.error}>{@render text(error)}</p>{/if}
    {#if hint}<p class="vin-hint" id={ids.hint}>{@render text(hint)}</p>{/if}
  </div>
{/if}
