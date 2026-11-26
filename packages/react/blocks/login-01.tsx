/* VinUI block: Sign in. Needs vin.css. */
export function Login01() {
  return (
    <section style={{ display: "grid", placeItems: "center", padding: "48px 16px" }}>
      <div className="vin-card" style={{ width: "100%", maxWidth: "380px" }}>
        <div className="vin-card__header">
          <h2 className="vin-card__title">Sign in to your account</h2>
          <p className="vin-card__desc">Enter your email and password to continue.</p>
        </div>
        <div className="vin-card__body">
          <form style={{ display: "grid", gap: "16px" }}>
            <div className="vin-field">
              <label className="vin-label" htmlFor="login-01-email">Email</label>
              <input id="login-01-email" className="vin-input" type="email" placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div className="vin-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                <label className="vin-label" htmlFor="login-01-password">Password</label>
                <a className="vin-link vin-small" href="/forgot-password">Forgot password?</a>
              </div>
              <input id="login-01-password" className="vin-input" type="password" autoComplete="current-password" required />
            </div>
            <div className="vin-choice">
              <input id="login-01-remember" className="vin-checkbox" type="checkbox" />
              <div className="vin-choice__body"><label className="vin-choice__label" htmlFor="login-01-remember">Keep me signed in</label></div>
            </div>
            <button type="submit" className="vin-btn">Sign in</button>
            <button type="button" className="vin-btn vin-btn--outline">Sign in with a passkey</button>
          </form>
        </div>
        <div className="vin-card__footer" style={{ justifyContent: "center", paddingBottom: "4px" }}>
          <p className="vin-small" style={{ margin: "0" }}>No account yet? <a className="vin-link" href="/signup">Create one</a></p>
        </div>
      </div>
    </section>
  );
}
