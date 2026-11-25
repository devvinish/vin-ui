import { NavigationMenu, NavigationMenuCard, NavigationMenuGrid, NavigationMenuItem, NavigationMenuLink } from "@/components/vin/navigation-menu";

export function NavigationMenuBasic() {
  return (
    <NavigationMenu label="Main">
      <NavigationMenuItem trigger="Products">
        <NavigationMenuGrid>
          <NavigationMenuCard href="#analytics" title="Analytics">See which pages people read and where they leave.</NavigationMenuCard>
          <NavigationMenuCard href="#automation" title="Automation">Run the boring steps for you, on a schedule.</NavigationMenuCard>
          <NavigationMenuCard href="#security" title="Security">Sign-in, roles and an audit log for every change.</NavigationMenuCard>
          <NavigationMenuCard href="#integrations" title="Integrations">Connect the tools your team already uses.</NavigationMenuCard>
        </NavigationMenuGrid>
      </NavigationMenuItem>
      <NavigationMenuItem trigger="Resources">
        <NavigationMenuGrid>
          <NavigationMenuCard href="#guides" title="Guides">Step-by-step walkthroughs for common jobs.</NavigationMenuCard>
          <NavigationMenuCard href="#blog" title="Blog">News, releases and how we build things.</NavigationMenuCard>
        </NavigationMenuGrid>
      </NavigationMenuItem>
      <NavigationMenuLink href="#docs" active>Docs</NavigationMenuLink>
      <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
    </NavigationMenu>
  );
}
