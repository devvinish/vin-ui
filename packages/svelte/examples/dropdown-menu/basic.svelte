<script lang="ts">
  import DropdownMenu from "@/components/vin/dropdown-menu.svelte";
  import DropdownMenuItem from "@/components/vin/dropdown-menu-item.svelte";
  import DropdownMenuLabel from "@/components/vin/dropdown-menu-label.svelte";
  import DropdownMenuSeparator from "@/components/vin/dropdown-menu-separator.svelte";
  import Button from "@/components/vin/button.svelte";
</script>

<DropdownMenu>
  {#snippet trigger(props)}<Button variant="outline" {...props}>My account</Button>{/snippet}
  <DropdownMenuLabel>Ada Lovelace</DropdownMenuLabel>
  <DropdownMenuItem shortcut="⇧⌘P">Profile</DropdownMenuItem>
  <DropdownMenuItem shortcut="⌘B">Billing</DropdownMenuItem>
  <DropdownMenuItem shortcut="⌘,">Settings</DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem>Invite people</DropdownMenuItem>
  <DropdownMenuItem disabled>API (soon)</DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem danger onSelect={() => console.log("signed out")}>Sign out</DropdownMenuItem>
</DropdownMenu>
