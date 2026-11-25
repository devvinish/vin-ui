/**
 * Ads (Mediavine), same pattern as the vinish.dev game pages:
 *   <aside class="... mv-siderail-slot" aria-label="Advertisement"><div id="...-300x600-r"></div></aside>
 * Mediavine fills the slot; we only provide the container.
 *
 * Mediavine adds its own script when the pages go out through WordPress, so the site never loads it.
 */
export const ads = {
  /** Render the mv-siderail-slot container in production builds. */
  enabled: true,
  /** Inner slot id. Keeps "300x600" in the name like the game pages. */
  slotId: "vinui-ad-300x600-r",
};
