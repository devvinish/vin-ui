<script lang="ts">
  import Carousel from "../../src/carousel.svelte";

  let { onSlideChange }: { onSlideChange?: (index: number) => void } = $props();
</script>

<Carousel label="Steps" items={["One", "Two", "Three", "Four"]} {onSlideChange}>
  {#snippet children(item)}<p>{item}</p>{/snippet}
</Carousel>
