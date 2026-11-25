<script lang="ts">
  import MessageScroller from "@/components/vin/message-scroller.svelte";
  import Bubble from "@/components/vin/bubble.svelte";
  import BubbleGroup from "@/components/vin/bubble-group.svelte";

  const chat: [from: "user" | "assistant", text: string][] = [
    ["user", "I'm going to Lisbon in March. Any tips?"],
    ["assistant", "March is lovely there: mild, and fewer crowds than summer. Bring good shoes, the hills are steep."],
    ["user", "Where should I stay?"],
    ["assistant", "Alfama for old streets and views, Chiado for shops and cafés, or Príncipe Real if you want somewhere quieter."],
    ["user", "How do I get from the airport?"],
    ["assistant", "The metro's red line goes straight to the city in about 25 minutes. A taxi takes 15 to 20 minutes."],
    ["user", "Is a day trip to Sintra worth it?"],
    ["assistant", "Yes. Take the train from Rossio, go early, and book Pena Palace tickets ahead."],
  ];
</script>

<MessageScroller outline style="width: 100%; max-width: 460px; height: 320px">
  <BubbleGroup>
    {#each chat as [from, text], i (i)}<Bubble as="p" {from}>{text}</Bubble>{/each}
  </BubbleGroup>
</MessageScroller>
