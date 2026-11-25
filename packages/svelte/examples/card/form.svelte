<script lang="ts">
  import Card from "@/components/vin/card.svelte";
  import CardHeader from "@/components/vin/card-header.svelte";
  import CardTitle from "@/components/vin/card-title.svelte";
  import CardDescription from "@/components/vin/card-description.svelte";
  import CardBody from "@/components/vin/card-body.svelte";
  import CardFooter from "@/components/vin/card-footer.svelte";
  import Field from "@/components/vin/input-field.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Card style="width: 100%; max-width: 360px">
  <CardHeader>
    <CardTitle>New project</CardTitle>
    <CardDescription>You can change these later.</CardDescription>
  </CardHeader>
  <CardBody>
    <Field label="Project name" placeholder="My app" />
  </CardBody>
  <CardFooter>
    <Button>Create</Button>
    <Button variant="outline">Cancel</Button>
  </CardFooter>
</Card>
