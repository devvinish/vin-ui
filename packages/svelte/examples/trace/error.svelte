<script lang="ts">
  import Trace from "@/components/vin/trace.svelte";
  import TraceStep from "@/components/vin/trace-step.svelte";
</script>

<Trace style="max-width: 520px">
  <TraceStep title="Drafted the email" kind="Result" duration="3s" />
  <TraceStep status="error" title="Looked up the contact" kind="Failed" duration="0.8s" open>
    <pre class="vin-trace__code">{'contacts.find({ name: "Grace" })\nError 403: the contacts app isn\'t connected.'}</pre>
  </TraceStep>
  <TraceStep status="pending" title="Send the email" kind="Tool call" />
</Trace>
