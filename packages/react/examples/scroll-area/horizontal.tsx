import { ScrollArea } from "@/components/vin/scroll-area";

const mix = (pct: number, other: string) => `color-mix(in srgb, var(--vin-accent) ${pct}%, ${other})`;
const playlists = [
  { name: "Morning focus", tracks: 24, art: `linear-gradient(135deg, var(--vin-accent), ${mix(35, "var(--vin-surface)")})` },
  { name: "Deep work", tracks: 18, art: `linear-gradient(200deg, ${mix(70, "var(--vin-fg)")}, ${mix(45, "var(--vin-surface)")})` },
  { name: "Late night", tracks: 31, art: `linear-gradient(45deg, ${mix(25, "var(--vin-surface)")}, var(--vin-accent))` },
  { name: "Road trip", tracks: 42, art: `linear-gradient(160deg, ${mix(55, "var(--vin-surface)")}, ${mix(80, "var(--vin-fg)")})` },
  { name: "Sunday", tracks: 15, art: `linear-gradient(90deg, var(--vin-accent), ${mix(20, "var(--vin-surface)")})` },
];

export function ScrollAreaHorizontal() {
  return (
    <ScrollArea orientation="horizontal" label="Playlists" style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ display: "flex", gap: 12, width: "max-content", padding: 16 }}>
        {playlists.map((p) => (
          <figure key={p.name} style={{ margin: 0, width: 120 }}>
            <div style={{ aspectRatio: 1, borderRadius: "var(--vin-radius)", background: p.art }} />
            <figcaption style={{ marginTop: 8 }}>
              {p.name}
              <br />
              <span style={{ color: "var(--vin-muted)" }}>{p.tracks} tracks</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </ScrollArea>
  );
}
