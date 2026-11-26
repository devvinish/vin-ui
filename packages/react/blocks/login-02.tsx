/* VinUI block: Sign in, split screen. Needs vin.css. */
export function Login02() {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", minHeight: "520px", borderRadius: "var(--vin-radius-lg)", overflow: "hidden", background: "var(--vin-surface)" }}>
      <div style={{ display: "grid", alignContent: "center", gap: "24px", padding: "48px clamp(20px, 6vw, 64px)" }}>
        <div style={{ display: "grid", gap: "6px" }}>
          <h2 className="vin-h3" style={{ margin: "0" }}>Welcome back</h2>
          <p className="vin-muted" style={{ margin: "0" }}>Sign in to pick up where you left off.</p>
        </div>
        <form style={{ display: "grid", gap: "16px" }}>
          <div className="vin-field">
            <label className="vin-label" htmlFor="login-02-email">Email</label>
            <input id="login-02-email" className="vin-input" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="vin-field">
            <label className="vin-label" htmlFor="login-02-password">Password</label>
            <input id="login-02-password" className="vin-input" type="password" autoComplete="current-password" required />
          </div>
          <button type="submit" className="vin-btn">Sign in</button>
        </form>
        <hr className="vin-separator" />
        <p className="vin-small" style={{ margin: "0" }}>New here? <a className="vin-link" href="/signup">Create an account</a></p>
      </div>
      <div style={{ display: "grid", alignContent: "space-between", gap: "32px", padding: "48px clamp(20px, 6vw, 64px)", color: "var(--vin-accent-fg)", background: "var(--vin-accent)" }}>
        <p style={{ margin: "0", fontWeight: "var(--vin-title-weight)", fontSize: "var(--vin-text-lg)" }}>Acme Inc.</p>
        <blockquote style={{ margin: "0", display: "grid", gap: "14px" }}>
          <p style={{ margin: "0", fontSize: "calc(var(--vin-text-lg) + 4px)", lineHeight: "1.45" }}>“We moved our whole dashboard over in a weekend. It finally looks like one product.”</p>
          <footer style={{ fontSize: "var(--vin-text-sm)" }}>Priya Nair, Head of Product</footer>
        </blockquote>
      </div>
    </section>
  );
}
