<script lang="ts">
  import Bubble from "@/components/vin/bubble.svelte";
  import BubbleGroup from "@/components/vin/bubble-group.svelte";
  import TypingBubble from "@/components/vin/bubble-typing.svelte";
</script>

<BubbleGroup style="width: 100%; max-width: 460px">
  <Bubble as="p" from="user">Summarise this thread for me.</Bubble>
  <TypingBubble />
</BubbleGroup>
