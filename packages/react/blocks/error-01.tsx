/* VinUI block: Page not found. Needs vin.css. */
export function Error01() {
  return (
    <section style={{ display: "grid", placeItems: "center", padding: "64px 16px" }}>
      <div className="vin-empty" style={{ maxWidth: "460px" }}>
        <div className="vin-empty__media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M8.5 8.5l5 5M13.5 8.5l-5 5" /></svg></div>
        <p className="vin-badge" style={{ margin: "0" }}>Error 404</p>
        <h2 className="vin-empty__title">We couldn't find that page</h2>
        <p className="vin-empty__description">The link may be old, or the page may have moved. Check the address, or start again from the home page.</p>
        <div className="vin-empty__actions">
          <a className="vin-btn" href="/">Go home</a>
          <a className="vin-btn vin-btn--outline" href="/search">Search the site</a>
        </div>
      </div>
    </section>
  );
}
