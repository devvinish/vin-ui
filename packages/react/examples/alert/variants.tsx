import { Alert } from "@/components/vin/alert";

export function AlertVariants() {
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 480 }}>
      <Alert variant="primary" title="A new version is out">Version 0.2 adds eight components.</Alert>
      <Alert variant="success" title="Payment received">We've emailed your receipt.</Alert>
      <Alert variant="warning" title="Your trial ends in 3 days">Add a card to keep your projects.</Alert>
      <Alert variant="danger" title="We couldn't save your changes">Check your connection and try again.</Alert>
    </div>
  );
}
