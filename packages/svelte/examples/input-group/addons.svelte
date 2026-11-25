<script lang="ts">
  import InputGroup from "@/components/vin/input-group.svelte";
</script>

<div style="display: grid; gap: 16px; width: 100%; max-width: 320px">
  <InputGroup label="Website" start="https://" placeholder="example.com" />
  <InputGroup label="Price (INR)" start="₹" end="per month" inputmode="decimal" value="1,499" />
</div>
