<script setup lang="ts">
import NavigationMenu, {
  NavigationMenuCard, NavigationMenuGrid, NavigationMenuItem, NavigationMenuLink,
} from "@/components/vin/navigation-menu.vue";
</script>

<template>
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
</template>
