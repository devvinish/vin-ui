<script lang="ts">
  import Card from "@/components/vin/card.svelte";
  import CardHeader from "@/components/vin/card-header.svelte";
  import CardTitle from "@/components/vin/card-title.svelte";
  import CardDescription from "@/components/vin/card-description.svelte";
  import CardFooter from "@/components/vin/card-footer.svelte";
  import Badge from "@/components/vin/badge.svelte";
</script>

<Card style="width: 100%; max-width: 280px">
  <CardHeader>
    <CardDescription>Monthly visitors</CardDescription>
    <CardTitle style="font-size: 28px">48,210</CardTitle>
  </CardHeader>
  <CardFooter>
    <Badge variant="success">+12.5%</Badge>
    <CardDescription>vs last month</CardDescription>
  </CardFooter>
</Card>
