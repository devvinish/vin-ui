import { InputGroup } from "@/components/vin/input-group";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export function InputGroupIcons() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 320 }}>
      <InputGroup
        type="search"
        placeholder="Search docs"
        aria-label="Search docs"
        start={<Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>}
        end="⌘K"
      />
      <InputGroup
        label="Email"
        type="email"
        placeholder="you@example.com"
        error="Enter a valid email address."
        start={<Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>}
      />
    </div>
  );
}
