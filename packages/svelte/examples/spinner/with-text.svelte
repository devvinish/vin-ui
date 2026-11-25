<script lang="ts">
  import Card from "@/components/vin/card.svelte";
  import CardBody from "@/components/vin/card-body.svelte";
  import Loading from "@/components/vin/spinner-loading.svelte";
</script>

<div style="display: grid; gap: 20px; justify-items: center; width: 100%; max-width: 300px">
  <Loading>Loading results…</Loading>
  <Card style="width: 100%">
    <CardBody style="display: grid; place-items: center; min-height: 120px">
      <Loading variant="primary">Fetching invoices…</Loading>
    </CardBody>
  </Card>
</div>
