/**
 * A React example as a live island: rendered on the server, then hydrated, so interactive
 * components (Select, Tabs…) behave exactly as they do in a user's app.
 */
import type { ComponentType } from "react";

const mods = import.meta.glob<Record<string, ComponentType>>("../../../../packages/react/examples/*/*.tsx", { eager: true });

export default function ReactExample({ name, id }: { name: string; id: string }) {
  const mod = mods[`../../../../packages/react/examples/${name}/${id}.tsx`];
  if (!mod) throw new Error(`Missing React example ${name}/${id}`);
  const Component = Object.values(mod)[0];
  return <Component />;
}
