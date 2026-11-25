import { SPECS } from "./registry";

/**
 * The full VinUI roadmap. A component is `ready` once spec/<slug>.json exists.
 * `phase`: 1 = core set, 2 = advanced + AI chat. VinUI goes public when both are done.
 * Field and Label are part of Input; right-to-left support is built into every component.
 */
export type ComponentEntry = { slug: string; name: string; category: string; description: string; phase: 1 | 2; ready: boolean };

const ROADMAP: Omit<ComponentEntry, "ready">[] = [
  // Actions
  { slug: "button", name: "Button", category: "Actions", description: "Trigger an action. 5 variants, 4 sizes.", phase: 1 },
  { slug: "button-group", name: "Button Group", category: "Actions", description: "Related buttons joined into one control.", phase: 1 },
  { slug: "toggle", name: "Toggle", category: "Actions", description: "A button that stays pressed or not.", phase: 1 },
  { slug: "toggle-group", name: "Toggle Group", category: "Actions", description: "A set of toggles, one or many on.", phase: 1 },

  // Forms
  { slug: "input", name: "Input", category: "Forms", description: "Text field with label, hint and error (Field, Label).", phase: 1 },
  { slug: "input-group", name: "Input Group", category: "Forms", description: "Input with icons, text or buttons attached.", phase: 1 },
  { slug: "input-otp", name: "Input OTP", category: "Forms", description: "One-time code entry, one box per digit.", phase: 1 },
  { slug: "textarea", name: "Textarea", category: "Forms", description: "Multi-line text with a character count.", phase: 1 },
  { slug: "checkbox", name: "Checkbox", category: "Forms", description: "Select one or many options.", phase: 1 },
  { slug: "radio-group", name: "Radio Group", category: "Forms", description: "Pick exactly one option from a few.", phase: 1 },
  { slug: "switch", name: "Switch", category: "Forms", description: "Turn a setting on or off.", phase: 1 },
  { slug: "native-select", name: "Native Select", category: "Forms", description: "The browser's own select, styled.", phase: 1 },
  { slug: "select", name: "Select", category: "Forms", description: "Pick one value from a custom list.", phase: 1 },
  { slug: "combobox", name: "Combobox", category: "Forms", description: "Select with type-to-search.", phase: 2 },
  { slug: "slider", name: "Slider", category: "Forms", description: "Choose a number or range by dragging.", phase: 1 },
  { slug: "calendar", name: "Calendar", category: "Forms", description: "Month view for picking dates.", phase: 2 },
  { slug: "date-picker", name: "Date Picker", category: "Forms", description: "Input with a calendar popover.", phase: 2 },

  // Data display
  { slug: "card", name: "Card", category: "Data display", description: "Container for grouped content.", phase: 1 },
  { slug: "badge", name: "Badge", category: "Data display", description: "Small status label.", phase: 1 },
  { slug: "avatar", name: "Avatar", category: "Data display", description: "User picture with initials fallback.", phase: 1 },
  { slug: "item", name: "Item", category: "Data display", description: "A row with media, text and actions, for lists.", phase: 1 },
  { slug: "table", name: "Table", category: "Data display", description: "Rows and columns of data.", phase: 1 },
  { slug: "data-table", name: "Data Table", category: "Data display", description: "Table with sorting, filtering and paging.", phase: 2 },
  { slug: "kbd", name: "Kbd", category: "Data display", description: "A keyboard key or shortcut.", phase: 1 },
  { slug: "separator", name: "Separator", category: "Data display", description: "A dividing line.", phase: 1 },
  { slug: "skeleton", name: "Skeleton", category: "Data display", description: "Placeholder while content loads.", phase: 1 },
  { slug: "empty", name: "Empty", category: "Data display", description: "What to show when there's nothing yet.", phase: 1 },
  { slug: "typography", name: "Typography", category: "Data display", description: "Headings, text, lists and quotes.", phase: 1 },
  { slug: "code-block", name: "Code Block", category: "Data display", description: "Code with a copy button.", phase: 2 },
  { slug: "aspect-ratio", name: "Aspect Ratio", category: "Data display", description: "Keep media at a fixed shape.", phase: 1 },
  { slug: "carousel", name: "Carousel", category: "Data display", description: "Slides you can swipe through.", phase: 2 },
  { slug: "chart", name: "Chart", category: "Data display", description: "Bar, line and area charts in your theme.", phase: 2 },

  // Navigation
  { slug: "tabs", name: "Tabs", category: "Navigation", description: "Switch between related views.", phase: 1 },
  { slug: "breadcrumb", name: "Breadcrumb", category: "Navigation", description: "Where a page sits in the hierarchy.", phase: 1 },
  { slug: "pagination", name: "Pagination", category: "Navigation", description: "Move between pages of results.", phase: 1 },
  { slug: "navigation-menu", name: "Navigation Menu", category: "Navigation", description: "Site menu with dropdown panels.", phase: 2 },
  { slug: "menubar", name: "Menubar", category: "Navigation", description: "Desktop-app style menu bar.", phase: 2 },
  { slug: "sidebar", name: "Sidebar", category: "Navigation", description: "Collapsible app sidebar.", phase: 2 },

  // Feedback
  { slug: "alert", name: "Alert", category: "Feedback", description: "Inline message for important information.", phase: 1 },
  { slug: "progress", name: "Progress", category: "Feedback", description: "Show how far a task has got.", phase: 1 },
  { slug: "spinner", name: "Spinner", category: "Feedback", description: "Something is loading.", phase: 1 },
  { slug: "toast", name: "Toast", category: "Feedback", description: "Brief notification after an action.", phase: 1 },

  // Overlays
  { slug: "dialog", name: "Dialog", category: "Overlays", description: "Modal window that needs a response.", phase: 1 },
  { slug: "alert-dialog", name: "Alert Dialog", category: "Overlays", description: "Confirm before something can't be undone.", phase: 1 },
  { slug: "sheet", name: "Sheet", category: "Overlays", description: "Panel that slides in from an edge.", phase: 1 },
  { slug: "drawer", name: "Drawer", category: "Overlays", description: "Bottom panel for phones, drag to close.", phase: 2 },
  { slug: "popover", name: "Popover", category: "Overlays", description: "Floating panel next to a trigger.", phase: 1 },
  { slug: "hover-card", name: "Hover Card", category: "Overlays", description: "Preview card on hover or focus.", phase: 2 },
  { slug: "tooltip", name: "Tooltip", category: "Overlays", description: "Short hint on hover or focus.", phase: 1 },
  { slug: "dropdown-menu", name: "Dropdown Menu", category: "Overlays", description: "List of actions in a popover.", phase: 1 },
  { slug: "context-menu", name: "Context Menu", category: "Overlays", description: "Menu on right-click or long-press.", phase: 2 },
  { slug: "command", name: "Command", category: "Overlays", description: "Search-and-run palette (⌘K).", phase: 2 },

  // Layout
  { slug: "accordion", name: "Accordion", category: "Layout", description: "Sections that expand and collapse.", phase: 1 },
  { slug: "collapsible", name: "Collapsible", category: "Layout", description: "Show and hide one section.", phase: 1 },
  { slug: "scroll-area", name: "Scroll Area", category: "Layout", description: "Scrolling region with styled scrollbars.", phase: 2 },
  { slug: "resizable", name: "Resizable", category: "Layout", description: "Panels you can drag to resize.", phase: 2 },

  // AI chat
  { slug: "message", name: "Message", category: "AI chat", description: "One chat message with author and actions.", phase: 2 },
  { slug: "bubble", name: "Bubble", category: "AI chat", description: "Chat bubble for user and assistant.", phase: 2 },
  { slug: "message-scroller", name: "Message Scroller", category: "AI chat", description: "Chat list that sticks to the newest message.", phase: 2 },
  { slug: "attachment", name: "Attachment", category: "AI chat", description: "File or image attached to a message.", phase: 2 },
  { slug: "marker", name: "Marker", category: "AI chat", description: "Inline citation or status marker.", phase: 2 },
  { slug: "questionnaire", name: "Questionnaire", category: "AI chat", description: "Multiple-choice questions inside a chat.", phase: 2 },
  { slug: "trace", name: "Trace", category: "AI chat", description: "Step-by-step view of what an agent did.", phase: 2 },
];

const ready = new Set(SPECS.map((s) => s.name));
export const COMPONENTS: ComponentEntry[] = ROADMAP.map((c) => ({ ...c, ready: ready.has(c.slug) }));

export const CATEGORIES = [...new Set(COMPONENTS.map((c) => c.category))];
