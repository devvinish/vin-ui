import { Trace, TraceStep } from "@/components/vin/trace";
import { Collapsible } from "@/components/vin/collapsible";

export function TraceGrouped() {
  return (
    <Collapsible trigger="Worked for 9s · 3 steps" defaultOpen style={{ width: "100%", maxWidth: 520 }}>
      <Trace>
        <TraceStep title="Opened sales-q3.csv" kind="Tool call" duration="0.4s" />
        <TraceStep title="Ran a Python script" kind="Tool call" duration="6.1s">
          <pre className="vin-trace__code">{'df.groupby("region")["revenue"].sum()'}</pre>
        </TraceStep>
        <TraceStep title="Made a chart of revenue by region" kind="Result" duration="2.5s" />
      </Trace>
    </Collapsible>
  );
}
