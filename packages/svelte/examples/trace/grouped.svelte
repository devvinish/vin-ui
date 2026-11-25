<script lang="ts">
  import Trace from "@/components/vin/trace.svelte";
  import TraceStep from "@/components/vin/trace-step.svelte";
  import Collapsible from "@/components/vin/collapsible.svelte";
</script>

<Collapsible trigger="Worked for 9s · 3 steps" open style="width: 100%; max-width: 520px">
  <Trace>
    <TraceStep title="Opened sales-q3.csv" kind="Tool call" duration="0.4s" />
    <TraceStep title="Ran a Python script" kind="Tool call" duration="6.1s">
      <pre class="vin-trace__code">{'df.groupby("region")["revenue"].sum()'}</pre>
    </TraceStep>
    <TraceStep title="Made a chart of revenue by region" kind="Result" duration="2.5s" />
  </Trace>
</Collapsible>
