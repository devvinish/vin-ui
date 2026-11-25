<script lang="ts">
  import Attachment from "@/components/vin/attachment.svelte";
  import AttachmentList from "@/components/vin/attachment-list.svelte";

  let files = $state<{ name: string; type?: string; size?: number; thumbnail?: string; variant?: "file" | "image" }[]>([
    { name: "design-brief.pdf", type: "PDF", size: 2516582 },
    { name: "hero-mountains.png", type: "PNG", size: 860160, thumbnail: "/ui/media/mountains.svg" },
    { name: "lake.jpg", variant: "image", thumbnail: "/ui/media/lake.svg" },
  ]);
</script>

<AttachmentList label="Attached files" style="max-width: 560px">
  {#each files as f (f.name)}
    <Attachment {...f} onRemove={() => (files = files.filter((x) => x !== f))} />
  {/each}
</AttachmentList>
