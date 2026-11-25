<script lang="ts">
  import Bubble from "@/components/vin/bubble.svelte";
  import BubbleGroup from "@/components/vin/bubble-group.svelte";
</script>

<BubbleGroup style="width: 100%; max-width: 460px">
  <Bubble as="p" from="user">Can you suggest a name for my hiking app?</Bubble>
  <Bubble>
    <p>A few ideas: <strong>Trailmark</strong>, <strong>Switchback</strong> or <strong>Ridgeline</strong>.</p>
    <p>Trailmark is short, easy to say and the domain is free.</p>
  </Bubble>
  <Bubble as="p" from="user">Trailmark it is!</Bubble>
</BubbleGroup>
