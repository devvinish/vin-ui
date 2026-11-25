<script lang="ts">
  import HoverCard from "@/components/vin/hover-card.svelte";
  import Text from "@/components/vin/typography.svelte";
  import Link from "@/components/vin/typography-link.svelte";
</script>

<Text>
  Read the
  <HoverCard side="top">
    {#snippet trigger(props)}<Link href="#theming" {...props}>theming guide</Link>{/snippet}
    <p class="vin-popover__title">Theming</p>
    <p class="vin-popover__description">Pick a style and any accent colour. Text on the accent stays readable in light and dark.</p>
    <p class="vin-hover-card__meta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      4 minute read
    </p>
  </HoverCard>
  before you pick an accent colour.
</Text>
