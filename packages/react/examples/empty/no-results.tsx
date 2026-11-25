import { Card } from "@/components/vin/card";
import { Empty } from "@/components/vin/empty";
import { Button } from "@/components/vin/button";

export function EmptyNoResults() {
  return (
    <Card style={{ width: "100%", maxWidth: 420 }}>
      <Empty
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>}
        title="No results for “astro”"
        description="Check the spelling or try a shorter word."
        actions={<Button variant="ghost" size="sm">Clear search</Button>}
      />
    </Card>
  );
}
