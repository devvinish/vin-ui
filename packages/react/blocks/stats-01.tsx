/* VinUI block: Stat cards. Needs vin.css. */
export function Stats01() {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
      <div className="vin-card">
        <div className="vin-card__body" style={{ display: "grid", gap: "8px", paddingBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>Total revenue</p>
            <span className="vin-badge vin-badge--success">+12.5%</span>
          </div>
          <p style={{ margin: "0", fontSize: "30px", fontWeight: "var(--vin-title-weight)", lineHeight: "1.1" }}>₹4,52,310</p>
          <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>Up from ₹4,02,050 last month</p>
        </div>
      </div>
      <div className="vin-card">
        <div className="vin-card__body" style={{ display: "grid", gap: "8px", paddingBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>Active users</p>
            <span className="vin-badge vin-badge--success">+4.3%</span>
          </div>
          <p style={{ margin: "0", fontSize: "30px", fontWeight: "var(--vin-title-weight)", lineHeight: "1.1" }}>8,940</p>
          <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>In the last 30 days</p>
        </div>
      </div>
      <div className="vin-card">
        <div className="vin-card__body" style={{ display: "grid", gap: "8px", paddingBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>Churn</p>
            <span className="vin-badge vin-badge--danger">+0.4%</span>
          </div>
          <p style={{ margin: "0", fontSize: "30px", fontWeight: "var(--vin-title-weight)", lineHeight: "1.1" }}>2.1%</p>
          <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>Target is under 2%</p>
        </div>
      </div>
      <div className="vin-card">
        <div className="vin-card__body" style={{ display: "grid", gap: "8px", paddingBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>Storage used</p>
            <span className="vin-badge">72%</span>
          </div>
          <p style={{ margin: "0", fontSize: "30px", fontWeight: "var(--vin-title-weight)", lineHeight: "1.1" }}>72 GB</p>
          <div className="vin-progress" role="progressbar" aria-label="Storage used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={72} style={{ ["--vin-value" as string]: "72%" }}></div>
        </div>
      </div>
    </section>
  );
}
