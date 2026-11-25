<!--
  VinUI · Toggle Group (Svelte). API: spec/toggle-group.json.
  type="single": one choice (a radio group of toggles). type="multiple": any number pressed.
  One Tab stop for the whole group; arrow keys move between items.
  Put <ToggleGroupItem> (toggle-group-item.svelte) inside. bind:value works (a string for single, string[] for multiple).
-->
<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Size = "sm" | "md" | "lg" | "icon";
  type Base = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    variant?: "default" | "outline";
    /** Size for every item. */
    size?: Size;
    /** Name the group with aria-label. */
    "aria-label"?: string;
    class?: string;
    children?: Snippet;
  };
  type Props =
    | (Base & { type: "single"; value?: string; onValueChange?: (value: string) => void })
    | (Base & { type: "multiple"; value?: string[]; onValueChange?: (value: string[]) => void });

  let { type, value = $bindable(), onValueChange, variant = "default", size, class: className, onkeydown, children, ...rest }: Props = $props();

  const single = $derived(type === "single");
  const toList = (v: string | string[] | undefined) => (v === undefined || v === "" ? [] : Array.isArray(v) ? v : [v]);
  const current = $derived(toList(value));
  let focused = $state<string>();

  // Items register in document order, so the first enabled one can be the Tab stop when nothing is on.
  type Registered = { readonly value: string; disabled: () => boolean };
  let items = $state.raw<Registered[]>([]);
  const first = () => items.find((i) => !i.disabled())?.value;

  function toggle(v: string) {
    const next = single ? [v] : current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    const out = single ? (next[0] ?? "") : next;
    value = out as typeof value;
    focused = v;
    (onValueChange as ((x: string | string[]) => void) | undefined)?.(out);
  }

  setContext("vin-toggle-group", {
    get single() {
      return single;
    },
    get size() {
      return size;
    },
    isOn: (v: string) => current.includes(v),
    isStop: (v: string) => (focused ?? current[0] ?? first()) === v,
    toggle,
    register(item: Registered) {
      items = [...items, item];
      return () => {
        items = items.filter((i) => i !== item);
      };
    },
  });

  function onKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(e);
    const all = [...e.currentTarget.querySelectorAll<HTMLButtonElement>(".vin-toggle:not(:disabled)")];
    const i = all.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = ({ ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    const target = step ? all[(i + step + all.length) % all.length] : e.key === "Home" ? all[0] : e.key === "End" ? all[all.length - 1] : null;
    if (!target) return;
    e.preventDefault();
    target.focus();
    const v = target.dataset.value!;
    if (single) toggle(v);
    else focused = v;
  }
</script>

<div
  {...rest}
  role={single ? "radiogroup" : "group"}
  class={["vin-toggle-group", variant === "outline" && "vin-toggle-group--outline", className].filter(Boolean).join(" ")}
  onkeydown={onKey}
>
  {@render children?.()}
</div>
