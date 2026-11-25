<!--
  VinUI · Avatar (Svelte). API: spec/avatar.json.
  role="img" with the person's name; the picture covers the initials, and if it fails to load the initials show.
  <AvatarGroup> is in avatar-group.svelte.
-->
<script lang="ts" module>
  /** "Ada Lovelace" → "AL". */
  export function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "class" | "children"> & {
    /** Who it is: the accessible name, and the initials when there's no picture. */
    name: string;
    src?: string;
    size?: "sm" | "md" | "lg";
    shape?: "circle" | "square";
    /** Presence dot. It is added to the name: "Ada Lovelace (online)". */
    status?: "online" | "busy" | "away";
    /** Text to show instead of the initials, e.g. "+3". */
    fallback?: string;
    class?: string;
  };
  let { name, src, size = "md", shape = "circle", status, fallback, class: className, ...rest }: Props = $props();

  // The picture that failed to load, so a new src gets a fresh try.
  let failed = $state<string>();
</script>

<span
  role="img"
  aria-label={status ? `${name} (${status})` : name}
  {...rest}
  class={["vin-avatar", size !== "md" && `vin-avatar--${size}`, shape === "square" && "vin-avatar--square", className].filter(Boolean).join(" ")}
>
  {#if src && failed !== src}<img class="vin-avatar__img" {src} alt="" onerror={() => (failed = src)} />{/if}
  <span class="vin-avatar__fallback">{fallback ?? initials(name)}</span>
  {#if status}<span class="vin-avatar__status vin-avatar__status--{status}"></span>{/if}
</span>
