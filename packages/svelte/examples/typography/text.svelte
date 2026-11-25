<script lang="ts">
  import Text from "@/components/vin/typography.svelte";
  import Code from "@/components/vin/typography-code.svelte";
  import Link from "@/components/vin/typography-link.svelte";
</script>

<div style="display: grid; gap: 14px; width: 100%; max-width: 520px">
  <Text variant="lead">Components you copy into your project, in the style you choose.</Text>
  <Text>
    Run <Code>npx @vinish/ui init</Code> once, then add what you need. Read the <Link href="#installation">installation guide</Link> for the details.
  </Text>
  <Text variant="muted">Works with plain HTML, React and Svelte.</Text>
  <Text variant="small">MIT licence. Free forever.</Text>
</div>
