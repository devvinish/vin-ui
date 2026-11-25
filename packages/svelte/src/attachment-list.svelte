<!--
  VinUI · Attachment List (Svelte). Part of attachment.svelte.
  A wrapping row of attachments. Each <Attachment> inside becomes a list item.
-->
<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLUListElement>, "class"> & {
    /** Name for the list, e.g. "Attached files". */
    label?: string;
    class?: string;
    children?: Snippet;
  };
  let { label, class: className, children, ...rest }: Props = $props();

  setContext("vin-attachment-list", true);
</script>

<ul aria-label={label} {...rest} class={["vin-attachment-list", className].filter(Boolean).join(" ")}>{@render children?.()}</ul>
