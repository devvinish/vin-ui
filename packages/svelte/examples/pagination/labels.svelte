<script lang="ts">
  import Pagination from "@/components/vin/pagination.svelte";
</script>

<Pagination page={1} count={3} labels href={(p) => `?page=${p}`} />
