import { Trace, TraceStep } from "@/components/vin/trace";

export function TraceError() {
  return (
    <Trace style={{ maxWidth: 520 }}>
      <TraceStep title="Drafted the email" kind="Result" duration="3s" />
      <TraceStep status="error" title="Looked up the contact" kind="Failed" duration="0.8s" defaultOpen>
        <pre className="vin-trace__code">{'contacts.find({ name: "Grace" })\nError 403: the contacts app isn\'t connected.'}</pre>
      </TraceStep>
      <TraceStep status="pending" title="Send the email" kind="Tool call" />
    </Trace>
  );
}
