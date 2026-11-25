<script lang="ts">
  import Message from "@/components/vin/message.svelte";
  import MessageAction from "@/components/vin/message-action.svelte";
  import MessageCopy from "@/components/vin/message-copy.svelte";
  import MessageFeedback from "@/components/vin/message-feedback.svelte";
  import Avatar from "@/components/vin/avatar.svelte";
</script>

{#snippet assistant()}<Avatar name="Assistant" size="sm" shape="square" fallback="AI" />{/snippet}

<Message style="max-width: 560px" avatar={assistant} author="Assistant" time="10:42" dateTime="2026-11-25T10:42">
  <p>Here are three ways to speed up your build:</p>
  <ul>
    <li>Cache <code>node_modules</code> between runs.</li>
    <li>Run the tests in parallel.</li>
    <li>Only rebuild the packages that changed.</li>
  </ul>
  {#snippet actions()}
    <MessageCopy />
    <MessageAction label="Retry"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg></MessageAction>
    <MessageFeedback />
  {/snippet}
</Message>
