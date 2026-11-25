<script setup lang="ts">
import ResizableGroup, { ResizablePanel, ResizableHandle } from "@/components/vin/resizable.vue";

const onLayout = (sizes: number[]) => console.log(sizes);
</script>

<template>
  <ResizableGroup style="width: 100%; max-width: 520px; height: 200px" @layout="onLayout">
    <ResizablePanel :default-size="30" :min-size="20">
      <div style="padding: 16px">
        <p style="margin: 0 0 8px; font-weight: 600">Mailboxes</p>
        <p style="margin: 0; color: var(--vin-muted)">Inbox<br />Drafts<br />Sent<br />Archive</p>
      </div>
    </ResizablePanel>
    <ResizableHandle label="Resize mailboxes" with-grip />
    <ResizablePanel :default-size="70" :min-size="30">
      <div style="padding: 16px">
        <p style="margin: 0 0 8px; font-weight: 600">Inbox</p>
        <p style="margin: 0; color: var(--vin-muted)">Drag the handle to give the list more room, or Tab to it and use the arrow keys.</p>
      </div>
    </ResizablePanel>
  </ResizableGroup>
</template>
