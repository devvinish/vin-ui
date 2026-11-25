<!--
  VinUI · Message Copy (Svelte). Part of message.svelte.
  Copies the message (or `text`) to the clipboard and says "Copied" for two seconds.
-->
<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import MessageAction from "./message-action.svelte";

  type Props = Omit<HTMLButtonAttributes, "class" | "aria-label" | "children"> & {
    /** The text to copy. Default: the message's content. */
    text?: string;
    label?: string;
    /** The label for two seconds after copying. Default: "Copied". */
    copiedLabel?: string;
    class?: string;
  };
  let { text, label = "Copy", copiedLabel = "Copied", onclick, ...rest }: Props = $props();

  let copied = $state(false);
  $effect(() => {
    if (!copied) return;
    const t = setTimeout(() => (copied = false), 2000);
    return () => clearTimeout(t);
  });

  function click(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(e);
    if (e.defaultPrevented) return;
    const value = text ?? e.currentTarget.closest(".vin-message")?.querySelector(".vin-message__content")?.textContent?.trim() ?? "";
    navigator.clipboard?.writeText(value).catch(() => {});
    copied = true;
  }
</script>

<MessageAction {...rest} label={copied ? copiedLabel : label} data-copied={copied || undefined} onclick={click}>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    ><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg
  >
</MessageAction>
