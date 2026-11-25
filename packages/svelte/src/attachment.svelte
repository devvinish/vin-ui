<!--
  VinUI · Attachment (Svelte). API: spec/attachment.json.
  A file or picture attached to a message: icon or thumbnail, name, size and type,
  an optional remove button, upload progress and an error state.
  Part: attachment-list (AttachmentList). Inside it, each Attachment is a list item.
-->
<script lang="ts" module>
  /** 2516582 → "2.4 MB". */
  export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let n = bytes / 1024,
      i = 0;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${i === 0 || n >= 100 ? Math.round(n) : Number(n.toFixed(1))} ${units[i]}`;
  }
</script>

<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class" | "children"> & {
    /** The file name. It is also the picture's alt text and part of the button labels. */
    name: string;
    /** Short type label, e.g. "PDF". */
    type?: string;
    /** Size in bytes, shown as "2.4 MB". */
    size?: number;
    /** Your own line under the name. Replaces type and size. */
    meta?: string | Snippet;
    /** "image" draws a square picture tile. Default: "file". */
    variant?: "file" | "image";
    /** A picture: the thumbnail in a file row, or the whole tile. */
    thumbnail?: string;
    /** Your own icon instead of the file icon. */
    icon?: Snippet;
    /** Makes it a link, e.g. to download a file that was sent. */
    href?: string;
    download?: boolean | string;
    /** Upload progress, 0–100. Shows a progress bar while it's set. */
    progress?: number;
    /** The upload failed: the message to show. */
    error?: string | Snippet;
    /** Shows a remove button (cancel while uploading). */
    onRemove?: () => void;
    /** With error: shows a retry button. */
    onRetry?: () => void;
    class?: string;
  };
  let {
    name,
    type,
    size,
    meta,
    variant = "file",
    thumbnail,
    icon,
    href,
    download,
    progress,
    error,
    onRemove,
    onRetry,
    class: className,
    ...rest
  }: Props = $props();

  const inList = getContext<boolean | undefined>("vin-attachment-list") ?? false;

  const uploading = $derived(progress != null && !error);
  const pct = $derived(uploading ? Math.round(Math.min(100, Math.max(0, progress ?? 0))) : 0);
  const link = $derived(href ? { href, download: download === true ? "" : download || undefined } : {});
  const classes = $derived(
    ["vin-attachment", variant === "image" && "vin-attachment--image", error != null && "vin-attachment--error", className].filter(Boolean).join(" "),
  );
  const line = $derived<string | Snippet | null>(
    error ?? (uploading ? `Uploading… ${pct}%` : (meta ?? ([type, size != null && formatBytes(size)].filter(Boolean).join(" · ") || null))),
  );
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet svg(paths: string[])}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    >{#each paths as d (d)}<path {d} />{/each}</svg
  >
{/snippet}

{#snippet remove()}
  {#if onRemove}
    <button
      type="button"
      class="vin-btn vin-btn--ghost vin-btn--icon vin-attachment__action"
      aria-label={uploading ? `Cancel upload of ${name}` : `Remove ${name}`}
      onclick={onRemove}
    >
      {@render svg(["M18 6 6 18", "m6 6 12 12"])}
    </button>
  {/if}
{/snippet}

{#snippet inner()}
  {#if variant === "image"}
    <img class="vin-attachment__thumb" src={thumbnail} alt={name} />
    {@render remove()}
  {:else}
    {#if thumbnail}
      <img class="vin-attachment__thumb" src={thumbnail} alt="" />
    {:else}
      <span class="vin-attachment__icon">
        {#if icon}{@render icon()}{:else if error != null}{@render svg([
            "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z",
            "M14 3v5h5",
            "M12 11v3.5",
            "M12 17.5h.01",
          ])}{:else}{@render svg(["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5", "M9 13h6", "M9 17h4"])}{/if}
      </span>
    {/if}
    <span class="vin-attachment__body">
      <span class="vin-attachment__name">{name}</span>
      {#if line != null}<span class="vin-attachment__meta">{@render text(line)}</span>{/if}
      {#if uploading}
        <span
          class="vin-progress vin-progress--sm"
          role="progressbar"
          aria-label={`Uploading ${name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          style={`--vin-value: ${pct}%`}
        ></span>
      {/if}
    </span>
    {#if error != null && onRetry}
      <button type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-attachment__action" aria-label={`Retry ${name}`} onclick={onRetry}>
        {@render svg(["M3 12a9 9 0 1 0 3-6.7L3 8", "M3 3v5h5"])}
      </button>
    {/if}
    {@render remove()}
  {/if}
{/snippet}

{#snippet item()}
  {#if href}
    <a {...rest} {...link} class={classes}>{@render inner()}</a>
  {:else}
    <div {...rest} class={classes}>{@render inner()}</div>
  {/if}
{/snippet}

{#if inList}
  <li>{@render item()}</li>
{:else}
  {@render item()}
{/if}
