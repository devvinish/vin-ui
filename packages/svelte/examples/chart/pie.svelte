<script lang="ts">
  import Chart from "@/components/vin/chart.svelte";

  const browsers = [
    { browser: "Chrome", visitors: 275 },
    { browser: "Safari", visitors: 200 },
    { browser: "Firefox", visitors: 187 },
    { browser: "Edge", visitors: 173 },
    { browser: "Other", visitors: 90 },
  ];
</script>

<Chart
  type="pie"
  label="Visitors by browser"
  data={browsers}
  index="browser"
  indexLabel="Browser"
  series={[{ key: "visitors", label: "Visitors" }]}
/>
