import { Item, ItemGroup } from "@/components/vin/item";
import { Badge } from "@/components/vin/badge";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const file = <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>;

export function ItemGroupExample() {
  return (
    <ItemGroup style={{ maxWidth: 420 }}>
      <Item media={<Icon>{file}</Icon>} title="Brand guidelines.pdf" description="2.4 MB · Edited today" actions={<Badge variant="success">Shared</Badge>} />
      <Item
        media={<Icon><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></Icon>}
        title="Hero image.png"
        description="840 KB · Edited yesterday"
        actions={<Badge>Draft</Badge>}
      />
      <Item media={<Icon>{file}<path d="M8 13h8M8 17h5" /></Icon>} title="Release notes.md" description="12 KB · Edited 3 days ago" actions={<Badge>Draft</Badge>} />
    </ItemGroup>
  );
}
