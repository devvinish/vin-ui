<script lang="ts">
  import Avatar from "@/components/vin/avatar.svelte";
  import AvatarGroup from "@/components/vin/avatar-group.svelte";
</script>

<AvatarGroup label="Project members">
  <Avatar name="Ada Lovelace" src="/ui/avatars/ada.svg" />
  <Avatar name="Alan Turing" src="/ui/avatars/alan.svg" />
  <Avatar name="Grace Hopper" src="/ui/avatars/grace.svg" />
  <Avatar name="Katherine Johnson" src="/ui/avatars/kat.svg" />
  <Avatar name="3 more people" fallback="+3" />
</AvatarGroup>
