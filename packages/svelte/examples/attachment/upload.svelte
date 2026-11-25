<script lang="ts">
  import Attachment from "@/components/vin/attachment.svelte";
  import AttachmentList from "@/components/vin/attachment-list.svelte";
</script>

<AttachmentList label="Uploads" style="max-width: 560px">
  <Attachment name="sales-q3.csv" progress={64} onRemove={() => {}} />
  <Attachment name="recording.mov" error="Upload failed" onRetry={() => {}} onRemove={() => {}} />
</AttachmentList>
