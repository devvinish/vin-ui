import { InputGroup } from "@/components/vin/input-group";
import { Button } from "@/components/vin/button";

export function InputGroupButtons() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <InputGroup
        label="API key"
        defaultValue="vin_live_8f2k…"
        readOnly
        end={
          <Button variant="ghost" size="icon" aria-label="Copy API key">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
          </Button>
        }
      />
      <InputGroup type="email" placeholder="you@example.com" aria-label="Email for newsletter" end={<Button>Subscribe</Button>} />
    </div>
  );
}
