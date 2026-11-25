<script setup lang="ts">
import CodeBlock from "@/components/vin/code-block.vue";

const code = `export default {
  style: "precision",
  accent: "#5b5bd6",
  mode: "system",
};`;
</script>

<template>
  <CodeBlock :code="code" filename="vinui.config.js" language="js" style="max-width: 520px" />
</template>
