import { HoverCard } from "@/components/vin/hover-card";
import { Text } from "@/components/vin/typography";

export function HoverCardLink() {
  return (
    <Text>
      Read the{" "}
      <HoverCard side="top" trigger={<a className="vin-link" href="#">theming guide</a>}>
        <p className="vin-popover__title">Theming</p>
        <p className="vin-popover__description">Pick a style and any accent colour. Text on the accent stays readable in light and dark.</p>
        <p className="vin-hover-card__meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          4 minute read
        </p>
      </HoverCard>{" "}
      before you pick an accent colour.
    </Text>
  );
}
