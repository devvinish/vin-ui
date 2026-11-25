<script lang="ts">
  import Message from "@/components/vin/message.svelte";
  import Avatar from "@/components/vin/avatar.svelte";
</script>

{#snippet assistant()}<Avatar name="Assistant" size="sm" shape="square" fallback="AI" />{/snippet}

<Message streaming style="max-width: 560px" avatar={assistant} author="Assistant" time="Writing…">
  <p>Sure. Start by opening the settings page and choosing</p>
</Message>
