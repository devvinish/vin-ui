<script setup lang="ts">
import ResizableGroup, { ResizablePanel, ResizableHandle } from "@/components/vin/resizable.vue";
</script>

<template>
  <ResizableGroup style="width: 100%; max-width: 560px; height: 260px">
    <ResizablePanel :default-size="25" :min-size="15">
      <div style="padding: 16px; font-weight: 600">Files</div>
    </ResizablePanel>
    <ResizableHandle label="Resize files" />
    <ResizablePanel :default-size="75" :min-size="30">
      <ResizableGroup orientation="vertical">
        <ResizablePanel :default-size="65" :min-size="20">
          <div style="padding: 16px; font-weight: 600">Preview</div>
        </ResizablePanel>
        <ResizableHandle label="Resize preview" />
        <ResizablePanel :default-size="35" :min-size="20">
          <div style="padding: 16px; font-weight: 600">Console</div>
        </ResizablePanel>
      </ResizableGroup>
    </ResizablePanel>
  </ResizableGroup>
</template>
