import { Empty } from "@/components/vin/empty";
import { Button } from "@/components/vin/button";

export function EmptyBasic() {
  return (
    <Empty
      style={{ maxWidth: 420 }}
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-8l-2-3H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z" /></svg>}
      title="No projects yet"
      description="Projects keep your components and theme together. Create one to get started."
      actions={<><Button>Create project</Button><Button variant="outline">Import</Button></>}
    />
  );
}
