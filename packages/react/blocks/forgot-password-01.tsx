/* VinUI block: Reset password. Needs vin.css. */
export function ForgotPassword01() {
  return (
    <section style={{ display: "grid", placeItems: "center", padding: "48px 16px" }}>
      <div className="vin-card" style={{ width: "100%", maxWidth: "380px" }}>
        <div className="vin-card__header">
          <h2 className="vin-card__title">Reset your password</h2>
          <p className="vin-card__desc">We'll email you a link to choose a new one.</p>
        </div>
        <div className="vin-card__body">
          <form style={{ display: "grid", gap: "16px" }}>
            <div className="vin-field">
              <label className="vin-label" htmlFor="forgot-01-email">Email</label>
              <input id="forgot-01-email" className="vin-input" type="email" placeholder="you@example.com" autoComplete="email" aria-describedby="forgot-01-hint" required />
              <p className="vin-hint" id="forgot-01-hint">Use the address you signed up with.</p>
            </div>
            <button type="submit" className="vin-btn">Send reset link</button>
          </form>
        </div>
        <div className="vin-card__footer" style={{ justifyContent: "center", paddingBottom: "4px" }}>
          <a className="vin-link vin-small" href="/login">Back to sign in</a>
        </div>
      </div>
    </section>
  );
}
