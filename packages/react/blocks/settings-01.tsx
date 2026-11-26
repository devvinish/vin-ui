/* VinUI block: Profile settings. Needs vin.css. */
export function Settings01() {
  return (
    <section style={{ display: "grid", placeItems: "center", padding: "32px 16px" }}>
      <form className="vin-card" style={{ width: "100%", maxWidth: "640px" }}>
        <div className="vin-card__header">
          <h2 className="vin-card__title">Profile</h2>
          <p className="vin-card__desc">This is how others see you on the site.</p>
        </div>
        <div className="vin-card__body" style={{ display: "grid", gap: "18px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}>
            <span className="vin-avatar vin-avatar--lg" role="img" aria-label="Meera Iyer"><span className="vin-avatar__fallback">MI</span></span>
            <button type="button" className="vin-btn vin-btn--outline vin-btn--sm">Change photo</button>
            <button type="button" className="vin-btn vin-btn--ghost vin-btn--sm">Remove</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div className="vin-field">
              <label className="vin-label" htmlFor="settings-01-name">Name</label>
              <input id="settings-01-name" className="vin-input" value="Meera Iyer" autoComplete="name" />
            </div>
            <div className="vin-field">
              <label className="vin-label" htmlFor="settings-01-email">Email</label>
              <input id="settings-01-email" className="vin-input" type="email" value="meera@example.com" autoComplete="email" />
            </div>
          </div>
          <div className="vin-field">
            <label className="vin-label" htmlFor="settings-01-bio">Bio</label>
            <textarea id="settings-01-bio" className="vin-input vin-textarea" rows={3} placeholder="A line or two about you" aria-describedby="settings-01-bio-hint"></textarea>
            <p className="vin-hint" id="settings-01-bio-hint">Shown on your public profile.</p>
          </div>
          <hr className="vin-separator" />
          <fieldset style={{ display: "grid", gap: "14px", margin: "0", padding: "0", border: "0" }}>
            <legend className="vin-label" style={{ marginBottom: "12px" }}>Email me about</legend>
            <div className="vin-choice">
              <input id="settings-01-mentions" className="vin-switch" type="checkbox" role="switch" defaultChecked />
              <div className="vin-choice__body">
                <label className="vin-choice__label" htmlFor="settings-01-mentions">Mentions and replies</label>
                <p className="vin-choice__desc">When someone mentions you or replies to you.</p>
              </div>
            </div>
            <div className="vin-choice">
              <input id="settings-01-digest" className="vin-switch" type="checkbox" role="switch" />
              <div className="vin-choice__body">
                <label className="vin-choice__label" htmlFor="settings-01-digest">Weekly summary</label>
                <p className="vin-choice__desc">One email every Monday with what changed.</p>
              </div>
            </div>
            <div className="vin-choice">
              <input id="settings-01-product" className="vin-switch" type="checkbox" role="switch" defaultChecked />
              <div className="vin-choice__body">
                <label className="vin-choice__label" htmlFor="settings-01-product">Product news</label>
                <p className="vin-choice__desc">New features, a few times a year.</p>
              </div>
            </div>
          </fieldset>
        </div>
        <div className="vin-card__footer" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="vin-btn vin-btn--ghost">Cancel</button>
          <button type="submit" className="vin-btn">Save changes</button>
        </div>
      </form>
    </section>
  );
}
