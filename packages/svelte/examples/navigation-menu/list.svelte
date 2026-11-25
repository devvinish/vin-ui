<script lang="ts">
  import NavigationMenu from "@/components/vin/navigation-menu.svelte";
  import NavigationMenuItem from "@/components/vin/navigation-menu-item.svelte";
  import NavigationMenuLink from "@/components/vin/navigation-menu-link.svelte";
  import NavigationMenuGrid from "@/components/vin/navigation-menu-grid.svelte";
  import NavigationMenuCard from "@/components/vin/navigation-menu-card.svelte";
</script>

<NavigationMenu label="Company">
  <NavigationMenuItem trigger="Company">
    <NavigationMenuGrid list>
      <NavigationMenuCard href="#about" title="About us" />
      <NavigationMenuCard href="#careers" title="Careers" />
      <NavigationMenuCard href="#press" title="Press kit" />
    </NavigationMenuGrid>
  </NavigationMenuItem>
  <NavigationMenuLink href="#contact">Contact</NavigationMenuLink>
</NavigationMenu>
