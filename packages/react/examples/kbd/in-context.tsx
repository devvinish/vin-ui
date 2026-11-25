import { Kbd, KbdGroup } from "@/components/vin/kbd";
import { Button } from "@/components/vin/button";
import { InputGroup } from "@/components/vin/input-group";

export function KbdInContext() {
  return (
    <>
      <Button variant="secondary">
        Save
        <KbdGroup><Kbd>⌘</Kbd><Kbd>S</Kbd></KbdGroup>
      </Button>
      <Button>
        Run
        <Kbd>↵</Kbd>
      </Button>
      <InputGroup
        style={{ width: "100%", maxWidth: 280 }}
        type="search"
        placeholder="Search"
        aria-label="Search"
        start={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>}
        end={<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>}
      />
    </>
  );
}
