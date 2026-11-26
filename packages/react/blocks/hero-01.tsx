/* VinUI block: Hero. Needs vin.css. */
export function Hero01() {
  return (
    <section style={{ display: "grid", justifyItems: "center", gap: "22px", padding: "clamp(48px, 9vw, 96px) 16px", textAlign: "center" }}>
      <span className="vin-badge vin-badge--outline"><span className="vin-badge__dot" aria-hidden="true"></span>New: version 2 is out</span>
      <h2 className="vin-h1" style={{ margin: "0", maxWidth: "760px", textWrap: "balance" }}>Ship a polished product without designing every screen</h2>
      <p className="vin-lead" style={{ margin: "0", maxWidth: "600px" }}>Ready-made sections that follow your colours and fonts. Copy one, change the words, and move on to the work only you can do.</p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
        <a className="vin-btn vin-btn--lg" href="/signup">Start for free</a>
        <a className="vin-btn vin-btn--outline vin-btn--lg" href="/demo">See a demo</a>
      </div>
      <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>Free for small teams. No card needed.</p>
    </section>
  );
}
