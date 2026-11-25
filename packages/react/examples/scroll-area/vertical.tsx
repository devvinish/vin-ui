import { Fragment } from "react";
import { ScrollArea } from "@/components/vin/scroll-area";
import { Separator } from "@/components/vin/separator";

const releases = ["v2.4.0", "v2.3.1", "v2.3.0", "v2.2.0", "v2.1.2", "v2.1.1", "v2.1.0", "v2.0.0", "v1.9.0", "v1.8.0"];

export function ScrollAreaVertical() {
  return (
    <ScrollArea label="Releases" style={{ width: "100%", maxWidth: 240, height: 220 }}>
      <div style={{ padding: "12px 16px" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Releases</p>
        {releases.map((r, i) => (
          <Fragment key={r}>
            {i > 0 && <Separator />}
            <div style={{ padding: "6px 0" }}>{r}</div>
          </Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
