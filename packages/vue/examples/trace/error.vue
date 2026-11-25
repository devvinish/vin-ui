<script setup lang="ts">
import Trace, { TraceStep } from "@/components/vin/trace.vue";

const code = 'contacts.find({ name: "Grace" })\nError 403: the contacts app isn\'t connected.';
</script>

<template>
  <Trace style="max-width: 520px">
    <TraceStep title="Drafted the email" kind="Result" duration="3s" />
    <TraceStep status="error" title="Looked up the contact" kind="Failed" duration="0.8s" default-open>
      <pre class="vin-trace__code">{{ code }}</pre>
    </TraceStep>
    <TraceStep status="pending" title="Send the email" kind="Tool call" />
  </Trace>
</template>
