<script setup lang="ts">
import DropdownMenu, { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/vin/dropdown-menu.vue";
import Button from "@/components/vin/button.vue";


const signOut = () => console.log("signed out");
</script>

<template>
  <DropdownMenu>
    <template #trigger><Button variant="outline">My account</Button></template>
    <DropdownMenuLabel>Ada Lovelace</DropdownMenuLabel>
    <DropdownMenuItem shortcut="⇧⌘P">Profile</DropdownMenuItem>
    <DropdownMenuItem shortcut="⌘B">Billing</DropdownMenuItem>
    <DropdownMenuItem shortcut="⌘,">Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Invite people</DropdownMenuItem>
    <DropdownMenuItem disabled>API (soon)</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem danger @select="signOut">Sign out</DropdownMenuItem>
  </DropdownMenu>
</template>
