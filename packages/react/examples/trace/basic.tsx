import { Trace, TraceStep } from "@/components/vin/trace";

export function TraceBasic() {
  return (
    <Trace style={{ maxWidth: 520 }}>
      <TraceStep title="Worked out what to look for" kind="Thought" duration="2s" />
      <TraceStep title="Searched the web" kind="Tool call" duration="1.2s" defaultOpen>
        <pre className="vin-trace__code">{'web_search({ query: "easy hiking trails near Denver" })'}</pre>
        <p>Found 8 results.</p>
      </TraceStep>
      <TraceStep title="Read 3 pages" kind="Tool call" duration="3.4s">
        <p>alltrails.com, coloradotrailexplorer.org, denvergov.org</p>
      </TraceStep>
      <TraceStep status="running" title="Writing the answer" kind="Result" duration="4s" />
    </Trace>
  );
}
