<script lang="ts">
  import Card from "@/components/vin/card.svelte";
  import CardHeader from "@/components/vin/card-header.svelte";
  import CardTitle from "@/components/vin/card-title.svelte";
  import CardDescription from "@/components/vin/card-description.svelte";
  import CardBody from "@/components/vin/card-body.svelte";
  import Collapsible from "@/components/vin/collapsible.svelte";
  import Text from "@/components/vin/typography.svelte";
</script>

<Card style="width: 100%; max-width: 360px">
  <CardHeader>
    <CardTitle>Who has access</CardTitle>
    <CardDescription>Ada Lovelace and 3 others.</CardDescription>
  </CardHeader>
  <CardBody>
    <Collapsible trigger="Show everyone">
      <Text variant="muted">Alan Turing, Grace Hopper, Katherine Johnson</Text>
    </Collapsible>
  </CardBody>
</Card>
