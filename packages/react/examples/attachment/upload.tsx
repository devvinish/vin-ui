import { Attachment, AttachmentList } from "@/components/vin/attachment";

export function AttachmentUpload() {
  return (
    <AttachmentList label="Uploads" style={{ maxWidth: 560 }}>
      <Attachment name="sales-q3.csv" progress={64} onRemove={() => {}} />
      <Attachment name="recording.mov" error="Upload failed" onRetry={() => {}} onRemove={() => {}} />
    </AttachmentList>
  );
}
