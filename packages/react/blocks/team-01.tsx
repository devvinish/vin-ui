/* VinUI block: Team members. Needs vin.css. */
export function Team01() {
  return (
    <section style={{ display: "grid", placeItems: "center", padding: "32px 16px" }}>
      <div className="vin-card" style={{ width: "100%", maxWidth: "600px" }}>
        <div className="vin-card__header">
          <h2 className="vin-card__title">Team members</h2>
          <p className="vin-card__desc">Invite people and choose what they can do.</p>
        </div>
        <div className="vin-card__body" style={{ display: "grid", gap: "18px", paddingBottom: "4px" }}>
          <form style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <label className="vin-label" htmlFor="team-01-invite" style={{ flexBasis: "100%" }}>Invite by email</label>
            <input id="team-01-invite" className="vin-input" type="email" placeholder="name@company.com" style={{ flex: "1 1 220px", width: "auto" }} />
            <button type="submit" className="vin-btn">Send invite</button>
          </form>
          <hr className="vin-separator" />
          <ul style={{ display: "grid", gap: "16px", margin: "0", padding: "0", listStyle: "none" }}>
            <li style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
              <span className="vin-avatar" role="img" aria-label="Meera Iyer"><span className="vin-avatar__fallback">MI</span></span>
              <div style={{ flex: "1 1 160px", minWidth: "0" }}>
                <p className="vin-small" style={{ margin: "0", fontWeight: "var(--vin-title-weight)" }}>Meera Iyer <span className="vin-badge">You</span></p>
                <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>meera@example.com</p>
              </div>
              <select className="vin-input vin-input--sm vin-native-select" aria-label="Role for Meera Iyer" style={{ width: "auto" }}>
                <option>Owner</option>
                <option>Admin</option>
                <option>Member</option>
              </select>
            </li>
            <li style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
              <span className="vin-avatar" role="img" aria-label="Arjun Das"><span className="vin-avatar__fallback">AD</span></span>
              <div style={{ flex: "1 1 160px", minWidth: "0" }}>
                <p className="vin-small" style={{ margin: "0", fontWeight: "var(--vin-title-weight)" }}>Arjun Das</p>
                <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>arjun@example.com</p>
              </div>
              <select className="vin-input vin-input--sm vin-native-select" aria-label="Role for Arjun Das" style={{ width: "auto" }}>
                <option>Admin</option>
                <option>Member</option>
                <option>Owner</option>
              </select>
            </li>
            <li style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
              <span className="vin-avatar" role="img" aria-label="Lena Fischer"><span className="vin-avatar__fallback">LF</span></span>
              <div style={{ flex: "1 1 160px", minWidth: "0" }}>
                <p className="vin-small" style={{ margin: "0", fontWeight: "var(--vin-title-weight)" }}>Lena Fischer <span className="vin-badge vin-badge--warning">Invited</span></p>
                <p className="vin-small" style={{ margin: "0", color: "var(--vin-muted)" }}>lena@example.com</p>
              </div>
              <select className="vin-input vin-input--sm vin-native-select" aria-label="Role for Lena Fischer" style={{ width: "auto" }}>
                <option>Member</option>
                <option>Admin</option>
                <option>Owner</option>
              </select>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
