<script lang="ts">
  import Combobox from "@/components/vin/combobox.svelte";

  const frameworks = [
    { value: "astro", label: "Astro" },
    { value: "angular", label: "Angular" },
    { value: "next", label: "Next.js" },
    { value: "nuxt", label: "Nuxt" },
    { value: "remix", label: "Remix" },
    { value: "solid", label: "SolidStart" },
    { value: "sveltekit", label: "SvelteKit" },
  ];
</script>

<Combobox label="Framework" options={frameworks} placeholder="Search frameworks…" name="framework" style="width: 100%; max-width: 320px" />
