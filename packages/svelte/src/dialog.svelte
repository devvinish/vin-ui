<!--
  VinUI · Dialog (Svelte). API: spec/dialog.json.
  The browser's modal <dialog>: it traps focus, Escape closes it, focus returns to the trigger.
    <Dialog title="Edit profile">
      {#snippet trigger(props)}<Button {...props}>Edit profile</Button>{/snippet}
      …
      {#snippet footer(close)}<Button onclick={close}>Done</Button>{/snippet}
    </Dialog>
  bind:open works.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";

  /** Spread these on the button that opens the dialog. */
  export type DialogTriggerProps = { "aria-haspopup": "dialog"; onclick: (e: MouseEvent) => void };

  export type DialogProps = Omit<HTMLDialogAttributes, "class" | "title" | "open" | "onsubmit" | "children"> & {
    /** The button that opens it: a snippet that spreads the props it gets. */
    trigger?: Snippet<[DialogTriggerProps]>;
    title: string | Snippet;
    description?: string | Snippet;
    /** Actions at the end. The snippet gets a close function for Cancel or Done buttons. */
    footer?: Snippet<[() => void]>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Wraps the body and footer in a form. A submit button sends it and closes the dialog. */
    onSubmit?: (data: FormData, event: SubmitEvent) => void;
    /** Close on a click outside. Default true. */
    dismissible?: boolean;
    /** Show the X button. Default true. */
    showClose?: boolean;
    /** Label for the X button. Default "Close". */
    closeLabel?: string;
    /** An icon before the title (Alert Dialog uses it for a warning). */
    icon?: Snippet;
    /** Make the footer a form[method=dialog]: a submit button in it closes the dialog and sets returnValue to its value. */
    footerForm?: boolean;
    class?: string;
    /** The body. The snippet gets a close function too. */
    children?: Snippet<[() => void]>;
  };
</script>

<script lang="ts">
  let {
    trigger,
    title,
    description,
    footer,
    open = $bindable(false),
    onOpenChange,
    onSubmit,
    dismissible = true,
    showClose = true,
    closeLabel = "Close",
    icon,
    footerForm = false,
    class: className,
    children,
    onclose,
    onclick,
    id,
    ...rest
  }: DialogProps = $props();

  const uid = $props.id();
  const base = `vin-dlg-${uid}`;
  let el = $state<HTMLDialogElement>();

  function setOpen(v: boolean) {
    open = v;
    onOpenChange?.(v);
  }
  const close = () => el?.close();

  // Open or close the native dialog to match the state.
  $effect(() => {
    const d = el;
    if (!d?.showModal) return;
    if (open && !d.open) {
      d.showModal();
      // Focus starts on the first field; put data-autofocus on something else to start there.
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && d.open) d.close();
  });

  function onDialogClick(e: MouseEvent & { currentTarget: EventTarget & HTMLDialogElement }) {
    onclick?.(e);
    if (!dismissible || e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  }
  function onDialogClose(e: Event & { currentTarget: EventTarget & HTMLDialogElement }) {
    onclose?.(e);
    if (open) setOpen(false);
  }

  const triggerProps: DialogTriggerProps = {
    "aria-haspopup": "dialog",
    onclick: (e: MouseEvent) => {
      if (!e.defaultPrevented) setOpen(true);
    },
  };
</script>

{#snippet text(v: string | Snippet)}{#if typeof v === "function"}{@render v()}{:else}{v}{/if}{/snippet}

{#snippet content()}
  {#if children}<div class="vin-dialog__body">{@render children(close)}</div>{/if}
  {#if footer}
    {#if footerForm}
      <form method="dialog" class="vin-dialog__footer">{@render footer(close)}</form>
    {:else}
      <div class="vin-dialog__footer">{@render footer(close)}</div>
    {/if}
  {/if}
{/snippet}

{@render trigger?.(triggerProps)}
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions (Escape closes the dialog natively; the click is only for the backdrop) -->
<dialog
  {...rest}
  bind:this={el}
  id={id ?? base}
  class={["vin-dialog", className].filter(Boolean).join(" ")}
  aria-labelledby={`${base}-title`}
  aria-describedby={description != null ? `${base}-desc` : undefined}
  onclose={onDialogClose}
  onclick={onDialogClick}
>
  <div class="vin-dialog__header">
    {@render icon?.()}
    <h2 class="vin-dialog__title" id={`${base}-title`}>{@render text(title)}</h2>
    {#if description != null}<p class="vin-dialog__description" id={`${base}-desc`}>{@render text(description)}</p>{/if}
  </div>
  {#if onSubmit}
    <form method="dialog" onsubmit={(e) => onSubmit(new FormData(e.currentTarget), e)}>{@render content()}</form>
  {:else}
    {@render content()}
  {/if}
  {#if showClose}
    <button type="button" class="vin-btn vin-btn--ghost vin-btn--icon vin-dialog__close" aria-label={closeLabel} onclick={close}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    </button>
  {/if}
</dialog>
