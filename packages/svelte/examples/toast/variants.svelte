<script lang="ts">
  import { toast } from "@/components/vin/toast.svelte";
  import Toaster from "@/components/vin/toast-toaster.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Button
  variant="outline"
  onclick={() => toast({ title: "Payment received", description: "We've emailed your receipt.", variant: "success" })}>Success</Button
>
<Button variant="outline" onclick={() => toast({ title: "Upload failed", description: "The file is larger than 10 MB.", variant: "danger" })}>Error</Button>
<Button variant="outline" onclick={() => toast({ title: "Message archived", action: { label: "Undo", onClick: () => {} } })}>With action</Button>
<Toaster />
