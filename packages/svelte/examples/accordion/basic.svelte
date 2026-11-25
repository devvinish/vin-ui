<script lang="ts">
  import Accordion from "@/components/vin/accordion.svelte";

  const faq = [
    { value: "free", title: "Is VinUI free?", content: "Yes. Every component is MIT licensed, so you can use it in personal and commercial work." },
    { value: "svelte", title: "Do I need Svelte?", content: "No. Each component comes as plain HTML and CSS too, with one small script for the interactive parts." },
    { value: "colours", title: "Can I change the colours?", content: "Pick any accent colour, light or dark mode, and one of eight styles." },
  ];
</script>

<Accordion items={faq} value={["free"]} style="max-width: 480px" />
