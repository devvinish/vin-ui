<script lang="ts">
  import Sheet from "@/components/vin/sheet.svelte";
  import Button from "@/components/vin/button.svelte";
  import Field from "@/components/vin/input-field.svelte";
</script>

<Sheet side="bottom" title="Share this page" description="Anyone with the link can view it.">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Share</Button>{/snippet}
  <Field label="Link" value="https://vinish.dev/ui" readonly />
</Sheet>
