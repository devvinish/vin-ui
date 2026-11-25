<!--
  VinUI · Command Dialog (Svelte). Part of command.svelte (needs it next to it).
  The ⌘K palette: Command in a modal dialog near the top of the screen. ⌘ / Ctrl + K toggles it.
    <CommandDialog title="Search docs" groups={…} onSelect={go}>
      {#snippet trigger(props)}<Button {...props}>Search docs…</Button>{/snippet}
    </CommandDialog>
  bind:open works.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { CommandProps } from "./command.svelte";

  /** Spread these on the button that opens the palette. */
  export type CommandDialogTriggerProps = {
    "aria-haspopup": "dialog";
    "aria-keyshortcuts"?: string;
    onclick: (e: MouseEvent) => void;
  };

  export type CommandDialogProps = CommandProps & {
    /** The button that opens it: a snippet that spreads the props it gets. */
    trigger?: Snippet<[CommandDialogTriggerProps]>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** ⌘ / Ctrl + this key toggles it. Default "k"; pass null for none. */
    shortcut?: string | null;
    /** Name for the dialog. Default "Command menu". */
    title?: string;
  };
</script>

<script lang="ts">
  import { setContext, untrack } from "svelte";
  import Command from "./command.svelte";

  let { trigger, open = $bindable(false), onOpenChange, shortcut = "k", title = "Command menu", ...command }: CommandDialogProps = $props();

  let el = $state<HTMLDialogElement>();
  let openCount = $state(0);

  function setOpen(v: boolean) {
    open = v;
    onOpenChange?.(v);
  }

  setContext("vin-command-dialog", {
    close: () => el?.close(),
    get openCount() {
      return openCount;
    },
  });

  $effect(() => {
    const d = el;
    if (!d?.showModal) return;
    if (open && !d.open) {
      d.showModal();
      untrack(() => openCount++);
    }
    if (!open && d.open) d.close();
  });

  $effect(() => {
    const key = shortcut;
    if (!key) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        // Never on top of another dialog.
        if (el?.open) setOpen(false);
        else if (!document.querySelector("dialog[open]")) setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const triggerProps = $derived<CommandDialogTriggerProps>({
    "aria-haspopup": "dialog",
    "aria-keyshortcuts": shortcut ? `Meta+${shortcut.toUpperCase()} Control+${shortcut.toUpperCase()}` : undefined,
    onclick: (e: MouseEvent) => {
      if (!e.defaultPrevented) setOpen(true);
    },
  });

  function onclick(e: MouseEvent & { currentTarget: EventTarget & HTMLDialogElement }) {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
  }
</script>

{@render trigger?.(triggerProps)}
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions (Escape closes the dialog natively; the click is only for the backdrop) -->
<dialog
  bind:this={el}
  class="vin-dialog vin-command-dialog"
  aria-label={title}
  onclose={() => {
    if (open) setOpen(false);
  }}
  {onclick}
>
  <Command {...command} />
</dialog>
