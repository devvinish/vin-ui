<!--
  VinUI · Toaster (Svelte). Where toasts appear. Put it once in your app (extra copies render nothing).
  Part of toast.svelte: call toast() from there.
-->
<script lang="ts" module>
  let owner: symbol | null = null;
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import Toast, { toasts, dismissToast, type ToastEntry } from "./toast.svelte";

  let { label = "Notifications" }: { label?: string } = $props();

  const me = Symbol("toaster");
  let active = $state(false);
  onMount(() => {
    if (!owner) owner = me;
    active = owner === me;
    return () => {
      if (owner === me) owner = null;
    };
  });

  // Each toast renders its live region empty first, then the text, so screen readers announce it.
  const ready = new SvelteSet<number>();
  type Timer = { timer?: ReturnType<typeof setTimeout>; frame?: number; left: number; started: number };
  const timers = new Map<number, Timer>();

  function run(id: number) {
    const t = timers.get(id);
    if (!t) return;
    clearTimeout(t.timer);
    t.started = Date.now();
    t.timer = setTimeout(() => dismissToast(id), t.left);
  }
  function pause(id: number) {
    const t = timers.get(id);
    if (!t) return;
    clearTimeout(t.timer);
    t.left -= Date.now() - t.started;
  }

  $effect(() => {
    if (!active) return;
    const list = toasts.entries;
    for (const entry of list) {
      if (timers.has(entry.id)) continue;
      const t: Timer = { left: entry.duration ?? 5000, started: 0 };
      timers.set(entry.id, t);
      t.frame = requestAnimationFrame(() => ready.add(entry.id));
      run(entry.id);
    }
    for (const [id, t] of timers) {
      if (list.some((e) => e.id === id)) continue;
      clearTimeout(t.timer);
      cancelAnimationFrame(t.frame!);
      timers.delete(id);
      ready.delete(id);
    }
  });
  $effect(() => () => {
    for (const t of timers.values()) {
      clearTimeout(t.timer);
      cancelAnimationFrame(t.frame!);
    }
    timers.clear();
  });

  /** Moves the region to the end of <body>, above everything else. */
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return () => node.remove();
  }

  const role = (e: ToastEntry) => (e.variant === "danger" ? "alert" : "status");
  const variantClass = (e: ToastEntry) => (e.variant && e.variant !== "default" ? `vin-toast vin-toast--${e.variant}` : "vin-toast");
</script>

{#if active}
  <section class="vin-toaster" aria-label={label} {@attach portal}>
    {#each toasts.entries as entry (entry.id)}
      {#if !ready.has(entry.id)}
        <div role={role(entry)} class={variantClass(entry)}></div>
      {:else}
        <Toast
          role={role(entry)}
          title={entry.title}
          description={entry.description}
          variant={entry.variant}
          action={entry.action && {
            label: entry.action.label,
            onClick: () => {
              entry.action!.onClick();
              dismissToast(entry.id);
            },
          }}
          onClose={() => dismissToast(entry.id)}
          data-leaving={entry.leaving ? "" : undefined}
          onpointerenter={() => pause(entry.id)}
          onpointerleave={() => run(entry.id)}
          onfocusin={() => pause(entry.id)}
          onfocusout={(e: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) run(entry.id);
          }}
        />
      {/if}
    {/each}
  </section>
{/if}
