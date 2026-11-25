/** Build a URL under the site base (/ui). `href("/components/button/")` → "/ui/components/button/". */
export function href(path = "/"): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + (path.startsWith("/") ? path : "/" + path);
}

export const SITE = {
  name: "VinUI",
  tagline: "One set of components. 8 styles. Any accent colour.",
  github: "https://github.com/vinish-dev/vin-ui",
  npm: "@vinish/ui",
};

/**
 * One Google Fonts URL for every style plus the site chrome.
 * Merges weights when two styles ask for the same family ("Inter:wght@400;500" + "Inter:wght@600").
 */
export function fontsHref(lists: string[][]): string {
  const fams = new Map<string, Set<number> | null>();
  for (const spec of lists.flat()) {
    const [name, axis] = spec.split(":");
    const weights = axis?.startsWith("wght@") ? axis.slice(5).split(";").map(Number) : null;
    const prev = fams.get(name);
    if (!fams.has(name)) fams.set(name, weights ? new Set(weights) : null);
    else if (weights) fams.set(name, new Set([...(prev ?? [400]), ...weights]));
  }
  const parts = [...fams].map(([n, w]) => `family=${n}${w ? `:wght@${[...w].sort((a, b) => a - b).join(";")}` : ""}`);
  return `https://fonts.googleapis.com/css2?${parts.join("&")}&display=swap`;
}
