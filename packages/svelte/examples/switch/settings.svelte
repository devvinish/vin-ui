<script lang="ts">
  import Switch from "@/components/vin/switch.svelte";
</script>

<div style="display: grid; gap: 18px; width: 100%; max-width: 380px">
  <Switch label="Marketing emails" description="News, offers and product updates." controlPosition="end" />
  <Switch label="Security alerts" description="Sign-ins from new devices." controlPosition="end" checked />
</div>
