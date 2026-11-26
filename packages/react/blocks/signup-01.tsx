/* VinUI block: Create account. Needs vin.css. */
export function Signup01() {
  return (
    <section style={{ display: "grid", placeItems: "center", padding: "48px 16px" }}>
      <div className="vin-card" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="vin-card__header">
          <h2 className="vin-card__title">Create your account</h2>
          <p className="vin-card__desc">Free for 14 days. No card needed.</p>
        </div>
        <div className="vin-card__body">
          <form style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
              <div className="vin-field">
                <label className="vin-label" htmlFor="signup-01-first">First name</label>
                <input id="signup-01-first" className="vin-input" autoComplete="given-name" required />
              </div>
              <div className="vin-field">
                <label className="vin-label" htmlFor="signup-01-last">Last name</label>
                <input id="signup-01-last" className="vin-input" autoComplete="family-name" required />
              </div>
            </div>
            <div className="vin-field">
              <label className="vin-label" htmlFor="signup-01-email">Work email</label>
              <input id="signup-01-email" className="vin-input" type="email" placeholder="you@company.com" autoComplete="email" required />
            </div>
            <div className="vin-field">
              <label className="vin-label" htmlFor="signup-01-password">Password</label>
              <input id="signup-01-password" className="vin-input" type="password" autoComplete="new-password" minLength={8} aria-describedby="signup-01-password-hint" required />
              <p className="vin-hint" id="signup-01-password-hint">At least 8 characters.</p>
            </div>
            <div className="vin-choice">
              <input id="signup-01-terms" className="vin-checkbox" type="checkbox" required />
              <div className="vin-choice__body"><label className="vin-choice__label" htmlFor="signup-01-terms">I agree to the terms and the privacy policy</label></div>
            </div>
            <button type="submit" className="vin-btn">Create account</button>
          </form>
        </div>
        <div className="vin-card__footer" style={{ justifyContent: "center", paddingBottom: "4px" }}>
          <p className="vin-small" style={{ margin: "0" }}>Already have an account? <a className="vin-link" href="/login">Sign in</a></p>
        </div>
      </div>
    </section>
  );
}
