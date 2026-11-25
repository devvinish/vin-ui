<!--
  VinUI · Alert Dialog (Svelte). API: spec/alert-dialog.json. Needs dialog.svelte next to it.
  Asks before something that can't be undone. Focus starts on Cancel; Escape cancels.
    <AlertDialog title="Delete this project?" action="Delete project" onAction={remove}>
      {#snippet trigger(props)}<Button variant="danger" {...props}>Delete</Button>{/snippet}
    </AlertDialog>
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import Dialog, { type DialogProps } from "./dialog.svelte";

  type Props = Omit<DialogProps, "footer" | "footerForm" | "dismissible" | "showClose" | "onSubmit" | "children" | "icon"> & {
    /** The confirm button's text. Default "Continue". */
    action?: string;
    /** The cancel button's text. Default "Cancel". */
    cancel?: string;
    /** The confirm button's look. Default "danger". */
    variant?: "default" | "danger";
    /** A warning icon beside the title: true for the built-in one, or your own svg.vin-alert-dialog__icon. */
    icon?: Snippet | true;
    /** Called when the user confirms. */
    onAction?: () => void;
    /** Called when the user cancels, with a button or Escape. */
    onCancel?: () => void;
  };
  let {
    action = "Continue",
    cancel = "Cancel",
    variant = "danger",
    icon,
    onAction,
    onCancel,
    class: className,
    onclose,
    open = $bindable(false),
    ...rest
  }: Props = $props();

  function closed(e: Event & { currentTarget: EventTarget & HTMLDialogElement }) {
    onclose?.(e);
    if (e.currentTarget.returnValue === "action") onAction?.();
    else onCancel?.();
    e.currentTarget.returnValue = "";
  }
</script>

{#snippet warning()}
  <svg class="vin-alert-dialog__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
{/snippet}

{#snippet buttons()}
  <!-- svelte-ignore a11y_autofocus -->
  <button type="submit" class="vin-btn vin-btn--outline" value="cancel" data-autofocus>{cancel}</button>
  <button type="submit" class={variant === "danger" ? "vin-btn vin-btn--danger" : "vin-btn"} value="action">{action}</button>
{/snippet}

<Dialog
  {...rest}
  bind:open
  role="alertdialog"
  class={["vin-alert-dialog", className].filter(Boolean).join(" ")}
  dismissible={false}
  showClose={false}
  icon={icon === true ? warning : icon}
  footerForm
  onclose={closed}
  footer={buttons}
/>
