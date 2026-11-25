<!--
  VinUI · Slider (Svelte). API: spec/slider.json.
  Pass a number for one value (a native range input), or [from, to] for a range:
  two role="slider" thumbs (WAI-ARIA multi-thumb slider) on one track. bind:value works.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  type Val = number | [number, number];
  type Props = Omit<HTMLInputAttributes, "class" | "value" | "type" | "min" | "max" | "step" | "name"> & {
    value?: Val;
    onValueChange?: (value: Val) => void;
    min?: number;
    max?: number;
    step?: number;
    /** Visible label. Without it, pass an aria-label (for a range: thumbLabels). */
    label?: string | Snippet;
    /** Show the current value next to the label. */
    showValue?: boolean;
    /** Format the shown value (and the range thumbs' aria-valuetext), e.g. (v) => `₹${v}`. */
    formatValue?: (v: number) => string;
    /** Range only: names for the two thumbs. Default: "Minimum", "Maximum". */
    thumbLabels?: [string, string];
    /** Form field name. A range submits name-min and name-max. */
    name?: string;
    class?: string;
  };
  let {
    value = $bindable(),
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = false,
    formatValue = String,
    thumbLabels = ["Minimum", "Maximum"],
    name,
    id,
    class: className,
    style,
    disabled,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const base = $derived(id ?? `vin-${uid}`);
  const labelId = $derived(`${base}-label`);
  const current = $derived<Val>(value ?? min);
  const range = $derived(Array.isArray(current));
  const pair = $derived<[number, number]>(Array.isArray(current) ? current : [current, current]);
  const frac = (v: number) => (v - min) / (max - min);
  const shown = $derived(Array.isArray(current) ? `${formatValue(current[0])} – ${formatValue(current[1])}` : formatValue(current));

  function set(v: Val) {
    value = v;
    onValueChange?.(v);
  }

  /* ---- Range: two thumbs on one track ---- */
  let track = $state<HTMLDivElement>();
  const rtl = () => !!track && getComputedStyle(track).direction === "rtl";

  function setThumb(i: 0 | 1, raw: number) {
    const [a, b] = pair;
    let v = Math.round((raw - min) / step) * step + min;
    v = Math.min(i === 0 ? b : max, Math.max(i === 0 ? min : a, v));
    if (v === pair[i]) return;
    set(i === 0 ? [v, b] : [a, v]);
  }
  function valueAt(x: number) {
    const el = track!;
    const r = el.getBoundingClientRect();
    const size = (el.querySelector(".vin-range__thumb") as HTMLElement).offsetWidth;
    let f = (x - r.left - size / 2) / (r.width - size || 1);
    if (rtl()) f = 1 - f;
    return min + Math.min(1, Math.max(0, f)) * (max - min);
  }
  function onThumbKey(i: 0 | 1, e: KeyboardEvent) {
    const dir = rtl() ? -1 : 1;
    const big = Math.max(step, (max - min) / 10);
    const d = ({ ArrowRight: step * dir, ArrowLeft: -step * dir, ArrowUp: step, ArrowDown: -step, PageUp: big, PageDown: -big } as Record<string, number>)[e.key];
    const v = pair[i];
    if (d !== undefined) {
      e.preventDefault();
      setThumb(i, v + d);
    } else if (e.key === "Home") {
      e.preventDefault();
      setThumb(i, min);
    } else if (e.key === "End") {
      e.preventDefault();
      setThumb(i, max);
    }
  }
  function onTrackDown(e: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    if (disabled) return;
    const el = e.currentTarget;
    const thumbs = [...el.querySelectorAll<HTMLElement>(".vin-range__thumb")];
    const hit = thumbs.indexOf(e.target as HTMLElement);
    const v = valueAt(e.clientX);
    const [a, b] = pair;
    const i = (hit >= 0 ? hit : a === b ? (v < a ? 0 : 1) : Math.abs(v - a) <= Math.abs(v - b) ? 0 : 1) as 0 | 1;
    e.preventDefault();
    thumbs[i].focus();
    if (hit < 0) setThumb(i, v);
    el.setPointerCapture?.(e.pointerId);
    const move = (ev: PointerEvent) => setThumb(i, valueAt(ev.clientX));
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  const controlStyle = $derived(
    [
      label ? undefined : style,
      range ? `--vin-from: ${frac(pair[0])}; --vin-to: ${frac(pair[1])}` : `--vin-fill: ${frac(pair[0]) * 100}%`,
    ]
      .filter(Boolean)
      .join("; "),
  );
</script>

{#snippet control()}
  {#if range}
    <!-- svelte-ignore a11y_no_static_element_interactions (the thumbs are the sliders; the track only moves them) -->
    <div
      bind:this={track}
      class={["vin-range", !label && className].filter(Boolean).join(" ")}
      style={controlStyle}
      aria-disabled={disabled || undefined}
      onpointerdown={onTrackDown}
    >
      {#each [0, 1] as const as i (i)}
        <span
          id={`${base}-${i === 0 ? "from" : "to"}`}
          class="vin-range__thumb"
          role="slider"
          tabindex={disabled ? -1 : 0}
          aria-label={thumbLabels[i]}
          aria-valuemin={i === 0 ? min : pair[0]}
          aria-valuemax={i === 0 ? pair[1] : max}
          aria-valuenow={pair[i]}
          aria-valuetext={formatValue(pair[i])}
          aria-disabled={disabled || undefined}
          onkeydown={(e) => onThumbKey(i, e)}
        ></span>
      {/each}
      {#if name}
        <input type="hidden" name={`${name}-min`} value={pair[0]} />
        <input type="hidden" name={`${name}-max`} value={pair[1]} />
      {/if}
    </div>
  {:else}
    <input
      {...rest}
      type="range"
      id={base}
      {name}
      class={["vin-slider", !label && className].filter(Boolean).join(" ")}
      style={controlStyle}
      {min}
      {max}
      {step}
      {disabled}
      value={pair[0]}
      oninput={(e) => set(+e.currentTarget.value)}
    />
  {/if}
{/snippet}

{#if !label}
  {@render control()}
{:else}
  <div class={["vin-field", className].filter(Boolean).join(" ")} {style} role={range ? "group" : undefined} aria-labelledby={range ? labelId : undefined}>
    <div class="vin-slider__head">
      {#if range}
        <span class="vin-label" id={labelId}>{#if typeof label === "function"}{@render label()}{:else}{label}{/if}</span>
      {:else}
        <label class="vin-label" id={labelId} for={base}>{#if typeof label === "function"}{@render label()}{:else}{label}{/if}</label>
      {/if}
      {#if showValue}<output class="vin-slider__value" for={range ? `${base}-from ${base}-to` : base}>{shown}</output>{/if}
    </div>
    {@render control()}
  </div>
{/if}
