import { Item } from "@/components/vin/item";
import { Avatar } from "@/components/vin/avatar";
import { Button } from "@/components/vin/button";

const Lock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);

export function ItemBasic() {
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 420 }}>
      <Item
        variant="outline"
        media={<Avatar name="Ada Lovelace" src="/ui/avatars/ada.svg" />}
        title="Ada Lovelace"
        description="ada@example.com"
        actions={<Button variant="outline" size="sm">Invite</Button>}
      />
      <Item
        variant="muted"
        media={<Lock />}
        title="Two-step sign-in"
        description="Ask for a code when you sign in on a new device."
        actions={<Button size="sm">Turn on</Button>}
      />
    </div>
  );
}
