/**
 * Ads (Mediavine), same pattern as the vinish.dev game pages:
 *   <aside class="... mv-siderail-slot" aria-label="Advertisement"><div id="...-300x600-r"></div></aside>
 * Mediavine fills the slot; we only provide the container.
 *
 * The VinUI pages are served from Cloudflare Pages (not WordPress), so the Mediavine
 * WordPress plugin does not add its script here. `scriptSrc` is the site's Mediavine
 * script tag (the same one the plugin puts on vinish.dev pages). Leave it empty and the
 * slot is still rendered, but no ads load.
 */
export const ads = {
  /** Render the mv-siderail-slot container in production builds. */
  enabled: true,
  /** Mediavine site script, e.g. "https://scripts.mediavine.com/tags/<site>.js". Copy from vinish.dev's page source. */
  scriptSrc: "",
  /** Inner slot id. Keeps "300x600" in the name like the game pages. */
  slotId: "vinui-ad-300x600-r",
};
