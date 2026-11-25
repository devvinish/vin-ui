/** Every component on the roadmap. `ready` ones have a full docs page. */
export type ComponentEntry = { slug: string; name: string; category: string; description: string; ready: boolean };

export const COMPONENTS: ComponentEntry[] = [
  { slug: "button", name: "Button", category: "Actions", description: "Trigger an action. 5 variants, 4 sizes.", ready: true },
  { slug: "input", name: "Input", category: "Forms", description: "Single-line text field with label and hint.", ready: false },
  { slug: "checkbox", name: "Checkbox", category: "Forms", description: "Select one or many options.", ready: false },
  { slug: "switch", name: "Switch", category: "Forms", description: "Turn a setting on or off.", ready: false },
  { slug: "select", name: "Select", category: "Forms", description: "Pick one value from a list.", ready: false },
  { slug: "card", name: "Card", category: "Data display", description: "Container for grouped content.", ready: false },
  { slug: "badge", name: "Badge", category: "Data display", description: "Small status label.", ready: false },
  { slug: "avatar", name: "Avatar", category: "Data display", description: "User picture with initials fallback.", ready: false },
  { slug: "tabs", name: "Tabs", category: "Navigation", description: "Switch between related views.", ready: false },
  { slug: "breadcrumb", name: "Breadcrumb", category: "Navigation", description: "Where a page sits in the hierarchy.", ready: false },
  { slug: "alert", name: "Alert", category: "Feedback", description: "Inline message for important information.", ready: false },
  { slug: "progress", name: "Progress", category: "Feedback", description: "Show how far a task has got.", ready: false },
  { slug: "toast", name: "Toast", category: "Feedback", description: "Brief notification after an action.", ready: false },
  { slug: "dialog", name: "Dialog", category: "Overlays", description: "Modal window that needs a response.", ready: false },
  { slug: "tooltip", name: "Tooltip", category: "Overlays", description: "Short hint on hover or focus.", ready: false },
  { slug: "dropdown-menu", name: "Dropdown Menu", category: "Overlays", description: "List of actions in a popover.", ready: false },
];

export const CATEGORIES = [...new Set(COMPONENTS.map((c) => c.category))];
