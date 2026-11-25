<script lang="ts">
  import Card from "@/components/vin/card.svelte";
  import CardHeader from "@/components/vin/card-header.svelte";
  import CardTitle from "@/components/vin/card-title.svelte";
  import CardDescription from "@/components/vin/card-description.svelte";
  import CardBody from "@/components/vin/card-body.svelte";
  import Separator from "@/components/vin/separator.svelte";
</script>

<Card style="width: 100%; max-width: 340px">
  <CardHeader>
    <CardTitle>VinUI</CardTitle>
    <CardDescription>Components in eight styles.</CardDescription>
  </CardHeader>
  <Separator />
  <CardBody>
    <p>Copy the HTML or the Svelte version. Both read the same theme.</p>
  </CardBody>
</Card>
