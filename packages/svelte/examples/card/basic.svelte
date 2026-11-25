<script lang="ts">
  import Card from "@/components/vin/card.svelte";
  import CardHeader from "@/components/vin/card-header.svelte";
  import CardTitle from "@/components/vin/card-title.svelte";
  import CardDescription from "@/components/vin/card-description.svelte";
  import CardBody from "@/components/vin/card-body.svelte";
  import CardFooter from "@/components/vin/card-footer.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Card style="width: 100%; max-width: 360px">
  <CardHeader>
    <CardTitle>Team plan</CardTitle>
    <CardDescription>Everything in Free, plus shared workspaces.</CardDescription>
  </CardHeader>
  <CardBody>
    <p>Invite up to 10 people, share components and keep one theme for the whole team.</p>
  </CardBody>
  <CardFooter>
    <Button>Upgrade</Button>
    <Button variant="ghost">Compare plans</Button>
  </CardFooter>
</Card>
