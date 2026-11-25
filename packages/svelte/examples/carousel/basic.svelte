<script lang="ts">
  import Carousel from "@/components/vin/carousel.svelte";
  import Heading from "@/components/vin/typography-heading.svelte";
  import Text from "@/components/vin/typography.svelte";

  const steps = [
    ["Pick a style", "Eight looks, one set of components."],
    ["Choose an accent", "Any colour. Text on it stays readable."],
    ["Copy the code", "Plain HTML or React. No build step needed."],
    ["Ship it", "Light, dark and accessible out of the box."],
  ];

  const panel =
    "display: grid; align-content: end; gap: 6px; min-height: 200px; padding: 28px; border-radius: var(--vin-radius-lg); background: color-mix(in srgb, var(--vin-accent) 13%, transparent)";
</script>

<Carousel label="Getting started" items={steps} style="max-width: 520px">
  {#snippet children([title, text])}
    <div style={panel}>
      <Heading level={3} style="margin: 0">{title}</Heading>
      <Text style="margin: 0">{text}</Text>
    </div>
  {/snippet}
</Carousel>
