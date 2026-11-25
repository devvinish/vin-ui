<script lang="ts">
  import HoverCard from "@/components/vin/hover-card.svelte";
  import Avatar from "@/components/vin/avatar.svelte";
  import Text from "@/components/vin/typography.svelte";
  import Link from "@/components/vin/typography-link.svelte";
</script>

<Text>
  Typography by
  <HoverCard>
    {#snippet trigger(props)}<Link href="#ada" {...props}>@ada</Link>{/snippet}
    <div class="vin-hover-card__header">
      <Avatar name="Ada Lovelace" src="/ui/avatars/ada.svg" />
      <div>
        <p class="vin-popover__title">Ada Lovelace</p>
        <p class="vin-hover-card__meta">@ada</p>
      </div>
    </div>
    <p class="vin-popover__description">Mathematician. Wrote notes on the Analytical Engine, including the first published program.</p>
    <p class="vin-hover-card__meta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></svg>
      Joined December 1815
    </p>
  </HoverCard>, who also wrote the first program.
</Text>
