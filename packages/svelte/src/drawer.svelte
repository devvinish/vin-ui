<!--
  VinUI · Drawer (Svelte). API: spec/drawer.json. Needs sheet.svelte and dialog.svelte next to it.
  A bottom Sheet with a handle: drag the handle strip or the header down to close it.
  Same props and snippets as Dialog.
    <Drawer title="Daily goal">
      {#snippet trigger(props)}<Button {...props}>Set goal</Button>{/snippet}
      …
      {#snippet footer(close)}<Button onclick={close}>Save goal</Button>{/snippet}
    </Drawer>
  bind:open works.
-->
<script lang="ts">
  import Sheet from "./sheet.svelte";
  import type { DialogProps } from "./dialog.svelte";

  type Pointer = PointerEvent & { currentTarget: EventTarget & HTMLDialogElement };

  let {
    class: className,
    open = $bindable(false),
    dismissible = true,
    onpointerdown,
    onpointermove,
    onpointerup,
    onpointercancel,
    ...rest
  }: DialogProps = $props();

  const drag = { on: false, y: 0, dy: 0, t: 0 };
  function end(el: HTMLDialogElement) {
    if (!drag.on) return;
    drag.on = false;
    const fast = drag.dy > 40 && drag.dy / Math.max(1, Date.now() - drag.t) > 0.6;
    el.style.transition = "";
    el.style.transform = "";
    if (dismissible && (drag.dy > Math.min(140, el.offsetHeight * 0.35) || fast)) el.close();
  }

  function down(e: Pointer) {
    onpointerdown?.(e);
    const el = e.currentTarget,
      t = e.target as HTMLElement;
    if (e.button !== 0 || !el.open) return;
    const top = e.clientY - el.getBoundingClientRect().top;
    if (!t.closest(".vin-dialog__header") && top > 28) return; // only the handle strip and the header
    if (t.closest("button, a, input, textarea, select")) return;
    Object.assign(drag, { on: true, y: e.clientY, dy: 0, t: Date.now() });
    el.setPointerCapture(e.pointerId);
    el.style.transition = "none";
  }
  function moveBy(e: Pointer) {
    onpointermove?.(e);
    if (!drag.on) return;
    drag.dy = Math.max(0, e.clientY - drag.y);
    e.currentTarget.style.transform = `translateY(${drag.dy}px)`;
  }
  function up(e: Pointer) {
    onpointerup?.(e);
    end(e.currentTarget);
  }
  function cancel(e: Pointer) {
    onpointercancel?.(e);
    end(e.currentTarget);
  }
</script>

<Sheet
  {...rest}
  bind:open
  side="bottom"
  {dismissible}
  class={["vin-drawer", className].filter(Boolean).join(" ")}
  onpointerdown={down}
  onpointermove={moveBy}
  onpointerup={up}
  onpointercancel={cancel}
/>
