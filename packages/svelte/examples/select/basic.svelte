<script lang="ts">
  import Select from "@/components/vin/select.svelte";

  const frameworks = [
    { value: "astro", label: "Astro" },
    { value: "next", label: "Next.js" },
    { value: "nuxt", label: "Nuxt" },
    { value: "remix", label: "Remix" },
    { value: "sveltekit", label: "SvelteKit" },
  ];
</script>

<Select label="Framework" options={frameworks} value="astro" name="framework" style="width: 100%; max-width: 320px" />
