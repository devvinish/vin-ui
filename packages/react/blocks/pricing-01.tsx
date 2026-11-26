/* VinUI block: Pricing. Needs vin.css. */
export function Pricing01() {
  return (
    <section style={{ display: "grid", gap: "32px", padding: "48px 16px" }}>
      <div style={{ display: "grid", justifyItems: "center", gap: "10px", textAlign: "center" }}>
        <h2 className="vin-h2" style={{ margin: "0" }}>Simple pricing</h2>
        <p className="vin-lead" style={{ margin: "0", maxWidth: "520px" }}>Start free. Upgrade when your team grows. Cancel any time.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "18px", alignItems: "start", width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
        <div className="vin-card">
          <div className="vin-card__header">
            <h3 className="vin-card__title">Free</h3>
            <p className="vin-card__desc">For trying things out.</p>
          </div>
          <div className="vin-card__body" style={{ display: "grid", gap: "16px" }}>
            <p style={{ margin: "0" }}><span style={{ fontSize: "36px", fontWeight: "var(--vin-title-weight)" }}>₹0</span> <span style={{ color: "var(--vin-muted)" }}>/ month</span></p>
            <ul style={{ display: "grid", gap: "10px", margin: "0", padding: "0", listStyle: "none" }}>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> 1 project</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Up to 3 people</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Community help</li>
            </ul>
          </div>
          <div className="vin-card__footer"><a className="vin-btn vin-btn--outline" href="/signup" style={{ width: "100%" }}>Get started</a></div>
        </div>
        <div className="vin-card" style={{ outline: "2px solid var(--vin-accent)", outlineOffset: "-1px" }}>
          <div className="vin-card__header">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <h3 className="vin-card__title">Pro</h3>
              <span className="vin-badge vin-badge--primary">Most popular</span>
            </div>
            <p className="vin-card__desc">For growing teams.</p>
          </div>
          <div className="vin-card__body" style={{ display: "grid", gap: "16px" }}>
            <p style={{ margin: "0" }}><span style={{ fontSize: "36px", fontWeight: "var(--vin-title-weight)" }}>₹1,499</span> <span style={{ color: "var(--vin-muted)" }}>/ month</span></p>
            <ul style={{ display: "grid", gap: "10px", margin: "0", padding: "0", listStyle: "none" }}>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Unlimited projects</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Up to 20 people</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Email support</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Custom domain</li>
            </ul>
          </div>
          <div className="vin-card__footer"><a className="vin-btn" href="/signup?plan=pro" style={{ width: "100%" }}>Start 14-day trial</a></div>
        </div>
        <div className="vin-card">
          <div className="vin-card__header">
            <h3 className="vin-card__title">Business</h3>
            <p className="vin-card__desc">For larger companies.</p>
          </div>
          <div className="vin-card__body" style={{ display: "grid", gap: "16px" }}>
            <p style={{ margin: "0" }}><span style={{ fontSize: "36px", fontWeight: "var(--vin-title-weight)" }}>₹4,999</span> <span style={{ color: "var(--vin-muted)" }}>/ month</span></p>
            <ul style={{ display: "grid", gap: "10px", margin: "0", padding: "0", listStyle: "none" }}>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Everything in Pro</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Unlimited people</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Single sign-on</li>
              <li style={{ display: "flex", gap: "10px" }}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", marginTop: "3px", color: "var(--vin-accent-text)" }}><path d="M20 6 9 17l-5-5" /></svg> Priority support</li>
            </ul>
          </div>
          <div className="vin-card__footer"><a className="vin-btn vin-btn--outline" href="/contact" style={{ width: "100%" }}>Contact sales</a></div>
        </div>
      </div>
    </section>
  );
}
