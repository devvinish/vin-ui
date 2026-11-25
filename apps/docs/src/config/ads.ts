/**
 * Ads (Mediavine), same setup as the 3D models site.
 *
 * To turn on: copy the Mediavine script URL and the sidebar slot markup exactly
 * as they are on the 3D models site, paste them here, and set `enabled: true`.
 * Until then the right sidebar shows a dashed placeholder (only when `showPlaceholder` is true)
 * so the layout and spacing can be reviewed.
 */
export const ads = {
  enabled: false,
  /** Mediavine site script URL from the 3D models site (goes in <head>). */
  scriptSrc: "",
  /** id / class that Mediavine targets for the right-sidebar unit. */
  sidebarId: "vinui-sidebar-ad",
  sidebarClass: "",
  /** Show a dashed placeholder while ads are not configured. Set false before launch. */
  showPlaceholder: true,
};
