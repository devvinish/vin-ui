<script lang="ts">
  import Attachment from "@/components/vin/attachment.svelte";
  import AttachmentList from "@/components/vin/attachment-list.svelte";
</script>

<AttachmentList label="Files in this message" style="max-width: 560px">
  <Attachment name="lake.jpg" variant="image" thumbnail="/ui/media/lake.svg" href="/ui/media/lake.svg" style="--vin-attachment-tile: 120px" />
  <Attachment name="report-2026.pdf" href="/files/report-2026.pdf" download meta="PDF · 1.1 MB · Download" />
</AttachmentList>
