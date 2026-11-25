<!-- VinUI · Resizable Panel (Svelte). Goes inside <ResizableGroup>. Part of resizable.svelte. -->
<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { ResizableContext } from "./resizable.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "class"> & {
    /** Starting size, in percent of the group. Panels without one share what is left. */
    defaultSize?: number;
    /** The smallest it can get, in percent. Default 10. */
    minSize?: number;
    class?: string;
    style?: string;
    children?: Snippet;
  };
  let { defaultSize, minSize = 10, id, class: className, style, children, ...rest }: Props = $props();

  const found = getContext<ResizableContext | undefined>("vin-resizable");
  if (!found) throw new Error("VinUI: <ResizablePanel> must be inside <ResizableGroup>");
  const ctx: ResizableContext = found;
  const register = () => ctx.addPanel({ size: defaultSize, min: minSize, id: id ?? undefined });
  const i = register();
</script>

<div {...rest} id={ctx.ids()[i]} class={["vin-resizable__panel", className].filter(Boolean).join(" ")} style={`${style ? `${style}; ` : ""}--vin-size: ${ctx.sizes()[i]}`}>
  {@render children?.()}
</div>
