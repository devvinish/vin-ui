import { Item } from "@/components/vin/item";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Chevron = () => <Icon><path d="m9 6 6 6-6 6" /></Icon>;

export function ItemLink() {
  return (
    <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 420 }}>
      <Item variant="outline" href="#" media={<Icon><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>} title="Profile" description="Name, photo and email" actions={<Chevron />} />
      <Item
        variant="outline"
        href="#"
        media={<Icon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></Icon>}
        title="Notifications"
        description="Email and push"
        actions={<Chevron />}
      />
    </div>
  );
}
