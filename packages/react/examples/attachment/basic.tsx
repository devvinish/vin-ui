"use client";

import * as React from "react";
import { Attachment, AttachmentList } from "@/components/vin/attachment";

export function AttachmentBasic() {
  const [files, setFiles] = React.useState([
    { name: "design-brief.pdf", type: "PDF", size: 2516582 },
    { name: "hero-mountains.png", type: "PNG", size: 860160, thumbnail: "/ui/media/mountains.svg" },
    { name: "lake.jpg", variant: "image" as const, thumbnail: "/ui/media/lake.svg" },
  ]);
  return (
    <AttachmentList label="Attached files" style={{ maxWidth: 560 }}>
      {files.map((f) => (
        <Attachment key={f.name} {...f} onRemove={() => setFiles((all) => all.filter((x) => x !== f))} />
      ))}
    </AttachmentList>
  );
}
