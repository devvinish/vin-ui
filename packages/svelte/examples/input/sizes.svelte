<script lang="ts">
  import Input from "@/components/vin/input.svelte";
</script>

<div class="vin-field" style="width: 100%; max-width: 320px">
  <Input size="sm" aria-label="Small input" placeholder="Small" />
  <Input aria-label="Medium input" placeholder="Medium" />
  <Input size="lg" aria-label="Large input" placeholder="Large" />
</div>
