import { Toggle } from "@/components/vin/toggle";

const Bold = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" /></svg>
);

/* size="icon" is the medium square; add the sm/lg class for the other square sizes. */
export function ToggleSizes() {
  return (
    <>
      <Toggle variant="outline" size="icon" className="vin-toggle--sm" aria-label="Bold, small" defaultPressed><Bold /></Toggle>
      <Toggle variant="outline" size="icon" aria-label="Bold, medium" defaultPressed><Bold /></Toggle>
      <Toggle variant="outline" size="icon" className="vin-toggle--lg" aria-label="Bold, large" defaultPressed><Bold /></Toggle>
    </>
  );
}
