<script lang="ts">
  import { toast } from "@/components/vin/toast.svelte";
  import Toaster from "@/components/vin/toast-toaster.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<Button variant="outline" onclick={() => toast("Changes saved")}>Save changes</Button>
<Toaster />
