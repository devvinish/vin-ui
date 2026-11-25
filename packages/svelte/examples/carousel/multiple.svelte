<script lang="ts">
  import Carousel from "@/components/vin/carousel.svelte";
  import Card from "@/components/vin/card.svelte";
  import CardHeader from "@/components/vin/card-header.svelte";
  import CardTitle from "@/components/vin/card-title.svelte";
  import CardDescription from "@/components/vin/card-description.svelte";

  const styles = [
    ["Precision", "Crisp hairlines, quiet depth."],
    ["Tactile", "Physical, pressable buttons."],
    ["Clay", "Puffy, friendly, inflated."],
    ["Tonal", "Colour-led, pill shapes, springy."],
    ["Editorial", "Typographic, airy, magazine."],
    ["Terminal", "Developer-native, monospace."],
    ["Paper", "Warm, hand-made, human."],
    ["Bento", "Calm, layered, borderless."],
  ];
</script>

<Carousel label="The eight styles" items={styles} perView={3} dots={false}>
  {#snippet children([name, text])}
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  {/snippet}
</Carousel>
