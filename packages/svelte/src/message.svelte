<!--
  VinUI · Message (Svelte). API: spec/message.json.
  One chat message: avatar, author and time, the content, and small icon actions.
    <Message author="Assistant" time="10:42">
      {#snippet avatar()}<Avatar name="Assistant" size="sm" />{/snippet}
      <p>…</p>
      {#snippet actions()}<MessageCopy /><MessageFeedback />{/snippet}
    </Message>
  Parts: message-action (MessageAction), message-copy (MessageCopy), message-feedback (MessageFeedback).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Who wrote it, shown above the content. */
    author?: string | Snippet;
    /** Usually an Avatar. It is hidden from screen readers, because the author name says who it is. */
    avatar?: Snippet;
    /** The time to show, e.g. "10:42". */
    time?: string | Snippet;
    /** Machine-readable time (ISO). With it, the time is a <time> element. */
    dateTime?: string;
    /** "end" puts the avatar on the end side, for the person's own messages. Default: "start". */
    align?: "start" | "end";
    /** The reply is still being written: shows a caret and sets aria-busy. */
    streaming?: boolean;
    /** Icon actions under the content: MessageCopy, MessageFeedback, MessageAction. */
    actions?: Snippet;
    /** Name for the actions group. Default: "Message actions". */
    actionsLabel?: string;
    class?: string;
    children?: Snippet;
  };
  let {
    author,
    avatar,
    time,
    dateTime,
    align = "start",
    streaming = false,
    actions,
    actionsLabel = "Message actions",
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

<article
  aria-busy={streaming || undefined}
  {...rest}
  class={["vin-message", align === "end" && "vin-message--end", streaming && "vin-message--streaming", className].filter(Boolean).join(" ")}
>
  {#if avatar}<div class="vin-message__avatar" aria-hidden="true">{@render avatar()}</div>{/if}
  <div class="vin-message__body">
    {#if author != null || time != null}
      <header class="vin-message__header">
        {#if author != null}<p class="vin-message__author">{@render text(author)}</p>{/if}
        {#if time != null}
          {#if dateTime}<time class="vin-message__time" datetime={dateTime}>{@render text(time)}</time>{:else}<span class="vin-message__time"
              >{@render text(time)}</span
            >{/if}
        {/if}
      </header>
    {/if}
    <div class="vin-message__content">{@render children?.()}</div>
    {#if actions}<div class="vin-message__actions" role="group" aria-label={actionsLabel}>{@render actions()}</div>{/if}
  </div>
</article>
