<script lang="ts">
  import Pagination from "@/components/vin/pagination.svelte";
</script>

<Pagination page={2} count={10} simple href={(p) => `?page=${p}`} />
