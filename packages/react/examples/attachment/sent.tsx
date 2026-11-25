import { Attachment, AttachmentList } from "@/components/vin/attachment";

export function AttachmentSent() {
  return (
    <AttachmentList label="Files in this message" style={{ maxWidth: 560 }}>
      <Attachment
        name="lake.jpg"
        variant="image"
        thumbnail="/ui/media/lake.svg"
        href="/ui/media/lake.svg"
        style={{ ["--vin-attachment-tile" as string]: "120px" }}
      />
      <Attachment name="report-2026.pdf" href="/files/report-2026.pdf" download meta="PDF · 1.1 MB · Download" />
    </AttachmentList>
  );
}
