<!--
  VinUI · Marker (Svelte). API: spec/marker.json.
  A numbered citation chip that links to its source and previews it on hover and focus.
  Escape hides the preview without moving the pointer or focus (WCAG 1.4.13).
  Part: marker-status (StatusMarker).
-->
<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type Props = Omit<HTMLAnchorAttributes, "class" | "title" | "children" | "href"> & {
    /** The number shown in the chip. */
    index: number | string;
    /** Where the source lives. */
    href: string;
    /** The source's title, shown in the preview and read out by screen readers. */
    title?: string;
    /** Where it's from, e.g. a domain. */
    source?: string;
    class?: string;
  };
  let { index, href, title, source, class: className, onmouseenter, onmouseleave, onfocus, onblur, ...rest }: Props = $props();

  let dismissed = $state(false);
  let active = 0;

  $effect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active > 0) dismissed = true;
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  const enter = () => {
    active++;
  };
  const leave = () => {
    active = Math.max(0, active - 1);
    if (!active) dismissed = false;
  };

  const label = $derived([`Source ${index}`, title && `: ${title}`, source && `, ${source}`].filter(Boolean).join(""));
</script>

<a
  aria-label={label}
  {...rest}
  {href}
  class={["vin-marker", className].filter(Boolean).join(" ")}
  data-dismissed={dismissed || undefined}
  onmouseenter={(e) => {
    enter();
    onmouseenter?.(e);
  }}
  onmouseleave={(e) => {
    leave();
    onmouseleave?.(e);
  }}
  onfocus={(e) => {
    enter();
    onfocus?.(e);
  }}
  onblur={(e) => {
    leave();
    onblur?.(e);
  }}
>
  {index}
  {#if title}
    <span class="vin-marker__preview" aria-hidden="true">
      <span class="vin-marker__title">{title}</span>
      {#if source}<span class="vin-marker__source">{source}</span>{/if}
    </span>
  {/if}
</a>
