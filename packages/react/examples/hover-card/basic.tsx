import { HoverCard } from "@/components/vin/hover-card";
import { Avatar } from "@/components/vin/avatar";
import { Text } from "@/components/vin/typography";

export function HoverCardBasic() {
  return (
    <Text>
      Typography by{" "}
      <HoverCard trigger={<a className="vin-link" href="#">@ada</a>}>
        <div className="vin-hover-card__header">
          <Avatar name="Ada Lovelace" src="/ui/avatars/ada.svg" />
          <div>
            <p className="vin-popover__title">Ada Lovelace</p>
            <p className="vin-hover-card__meta">@ada</p>
          </div>
        </div>
        <p className="vin-popover__description">Mathematician. Wrote notes on the Analytical Engine, including the first published program.</p>
        <p className="vin-hover-card__meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></svg>
          Joined December 1815
        </p>
      </HoverCard>
      , who also wrote the first program.
    </Text>
  );
}
