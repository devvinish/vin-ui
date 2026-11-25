<!--
  VinUI · Navigation Menu (Svelte). API: spec/navigation-menu.json.
  Disclosure buttons whose panels open on hover, click or Down Arrow.
    <NavigationMenu label="Main">
      <NavigationMenuItem trigger="Products">
        <NavigationMenuGrid><NavigationMenuCard href="/analytics" title="Analytics">See what's working.</NavigationMenuCard></NavigationMenuGrid>
      </NavigationMenuItem>
      <NavigationMenuLink href="/docs" active>Docs</NavigationMenuLink>
    </NavigationMenu>
  Parts: navigation-menu-item, navigation-menu-link, navigation-menu-grid, navigation-menu-card.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Name for the navigation, read by screen readers. */
    label: string;
    class?: string;
    children?: Snippet;
  };
  let { label, class: className, onkeydown, children, ...rest }: Props = $props();

  // Left and Right Arrow, Home and End move between the top-level items.
  function onKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
    onkeydown?.(e);
    const list = [...e.currentTarget.querySelectorAll<HTMLElement>(".vin-nav-menu__item > .vin-nav-menu__trigger, .vin-nav-menu__item > .vin-nav-menu__link")];
    const i = list.indexOf(e.target as HTMLElement);
    if (i < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next =
      e.key === "ArrowRight" || e.key === "ArrowLeft"
        ? list[(i + ((e.key === "ArrowRight") !== rtl ? 1 : -1) + list.length) % list.length]
        : e.key === "Home"
          ? list[0]
          : e.key === "End"
            ? list[list.length - 1]
            : null;
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }
</script>

<nav {...rest} aria-label={label} class={["vin-nav-menu", className].filter(Boolean).join(" ")} onkeydown={onKey}>
  <ul class="vin-nav-menu__list">{@render children?.()}</ul>
</nav>
