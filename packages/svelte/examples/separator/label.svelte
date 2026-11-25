<script lang="ts">
  import Button from "@/components/vin/button.svelte";
  import Field from "@/components/vin/input-field.svelte";
  import Separator from "@/components/vin/separator.svelte";
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
  <Button variant="outline">Continue with GitHub</Button>
  <Separator label="or" />
  <Field label="Email" type="email" placeholder="you@example.com" />
  <Button>Continue with email</Button>
</div>
