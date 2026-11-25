<script lang="ts">
  import Textarea from "@/components/vin/textarea.svelte";
</script>

<Textarea
  label="Bio"
  rows={3}
  maxlength={160}
  value="Designer and developer in Delhi."
  hint="Shown on your profile."
  style="width: 100%; max-width: 360px"
/>
