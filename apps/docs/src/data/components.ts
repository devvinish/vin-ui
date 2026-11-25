import { SPECS } from "./registry";

/** Every component on the roadmap. A component is `ready` once spec/<slug>.json exists. */
export type ComponentEntry = { slug: string; name: string; category: string; description: string; ready: boolean };

const ROADMAP: Omit<ComponentEntry, "ready">[] = [
  { slug: "button", name: "Button", category: "Actions", description: "Trigger an action. 5 variants, 4 sizes." },
  { slug: "input", name: "Input", category: "Forms", description: "Single-line text field with label and hint." },
  { slug: "checkbox", name: "Checkbox", category: "Forms", description: "Select one or many options." },
  { slug: "switch", name: "Switch", category: "Forms", description: "Turn a setting on or off." },
  { slug: "select", name: "Select", category: "Forms", description: "Pick one value from a list." },
  { slug: "card", name: "Card", category: "Data display", description: "Container for grouped content." },
  { slug: "badge", name: "Badge", category: "Data display", description: "Small status label." },
  { slug: "avatar", name: "Avatar", category: "Data display", description: "User picture with initials fallback." },
  { slug: "tabs", name: "Tabs", category: "Navigation", description: "Switch between related views." },
  { slug: "breadcrumb", name: "Breadcrumb", category: "Navigation", description: "Where a page sits in the hierarchy." },
  { slug: "alert", name: "Alert", category: "Feedback", description: "Inline message for important information." },
  { slug: "progress", name: "Progress", category: "Feedback", description: "Show how far a task has got." },
  { slug: "toast", name: "Toast", category: "Feedback", description: "Brief notification after an action." },
  { slug: "dialog", name: "Dialog", category: "Overlays", description: "Modal window that needs a response." },
  { slug: "tooltip", name: "Tooltip", category: "Overlays", description: "Short hint on hover or focus." },
  { slug: "dropdown-menu", name: "Dropdown Menu", category: "Overlays", description: "List of actions in a popover." },
];

const ready = new Set(SPECS.map((s) => s.name));
export const COMPONENTS: ComponentEntry[] = ROADMAP.map((c) => ({ ...c, ready: ready.has(c.slug) }));

export const CATEGORIES = [...new Set(COMPONENTS.map((c) => c.category))];
