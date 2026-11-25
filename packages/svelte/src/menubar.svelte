<!--
  VinUI · Menubar (Svelte). API: spec/menubar.json.
  The WAI-ARIA menubar: one tab stop, Left/Right between the menus, Down or Up opens one.
  Each menu holds the Dropdown Menu items.
    <Menubar label="Editor">
      <MenubarMenu label="File">
        <DropdownMenuItem shortcut="⌘N">New window</DropdownMenuItem>
      </MenubarMenu>
    </Menubar>
  Parts: menubar-menu. Needs the dropdown-menu-* item parts.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  export type MenubarContext = {
    readonly active: number;
    /** Each menu gets its place in the bar when it's created. */
    register: () => number;
    setActive: (index: number) => void;
    openFrom: (from: HTMLElement, step: number, last?: boolean) => void;
    focusFrom: (from: HTMLElement, where: "next" | "prev" | "first" | "last") => void;
    anyOpen: () => boolean;
  };

  export type MenubarProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "role"> & {
    /** Name for the bar, read by screen readers. */
    label: string;
    class?: string;
    children?: Snippet;
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";

  let { label, class: className, children, ...rest }: MenubarProps = $props();

  let bar = $state<HTMLDivElement>();
  let active = $state(0);
  let count = 0;

  const triggers = () => [...(bar?.querySelectorAll<HTMLButtonElement>(".vin-menubar__trigger") ?? [])].filter((t) => !t.disabled);
  const menuOf = (t: HTMLElement) => document.getElementById(t.getAttribute("popovertarget") ?? "");
  const rtl = () => !!bar && getComputedStyle(bar).direction === "rtl";
  const isOpen = (t: HTMLElement) => !!menuOf(t)?.matches(":popover-open");

  /** The trigger `step` places along from `from`, wrapping round; Left and Right swap in right-to-left text. */
  function pick(from: HTMLElement, step: number) {
    const list = triggers();
    if (!list.length) return undefined;
    const i = Math.max(0, list.indexOf(from as HTMLButtonElement));
    const s = rtl() ? -step : step;
    return list[(i + s + list.length) % list.length];
  }

  const ctx: MenubarContext = {
    get active() {
      return active;
    },
    register: () => count++,
    setActive: (i) => (active = i),
    openFrom(from, step, last = false) {
      const t = pick(from, step);
      const menu = t && menuOf(t);
      if (!t || !menu) return;
      menu.toggleAttribute("data-vin-last", last);
      if (menu.matches(":popover-open")) {
        menu.dispatchEvent(new Event("vin-focus-item"));
        return;
      }
      // Only one menu is open at a time.
      for (const other of triggers()) if (other !== t && isOpen(other)) menuOf(other)?.hidePopover();
      menu.showPopover?.();
    },
    focusFrom(from, where) {
      const list = triggers();
      const to = where === "first" ? list[0] : where === "last" ? list[list.length - 1] : pick(from, where === "next" ? 1 : -1);
      to?.focus();
    },
    anyOpen: () => triggers().some(isOpen),
  };
  setContext("vin-menubar", ctx);
</script>

<div {...rest} bind:this={bar} role="menubar" aria-label={label} class={["vin-menubar", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</div>
