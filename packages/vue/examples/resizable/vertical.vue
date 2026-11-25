<script setup lang="ts">
import ResizableGroup, { ResizablePanel, ResizableHandle } from "@/components/vin/resizable.vue";

const code = "margin: 0; padding: 12px 16px; font: 13px/1.6 ui-monospace, monospace";
const source = "export function greet(name) {\n  return `Hello, ${name}!`;\n}";
const output = "$ npm run dev\nReady on http://localhost:4321";
</script>

<template>
  <ResizableGroup orientation="vertical" style="width: 100%; max-width: 420px; height: 260px">
    <ResizablePanel :default-size="60" :min-size="15">
      <pre :style="code">{{ source }}</pre>
    </ResizablePanel>
    <ResizableHandle label="Resize editor" with-grip />
    <ResizablePanel :default-size="40" :min-size="15">
      <pre :style="code + '; color: var(--vin-muted)'">{{ output }}</pre>
    </ResizablePanel>
  </ResizableGroup>
</template>
