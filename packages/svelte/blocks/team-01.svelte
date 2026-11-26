<!-- VinUI block: Team members. Needs vin.css. -->
<section style="display: grid; place-items: center; padding: 32px 16px">
  <div class="vin-card" style="width: 100%; max-width: 600px">
    <div class="vin-card__header">
      <h2 class="vin-card__title">Team members</h2>
      <p class="vin-card__desc">Invite people and choose what they can do.</p>
    </div>
    <div class="vin-card__body" style="display: grid; gap: 18px; padding-bottom: 4px">
      <form style="display: flex; flex-wrap: wrap; gap: 8px">
        <label class="vin-label" for="team-01-invite" style="flex-basis: 100%">Invite by email</label>
        <input id="team-01-invite" class="vin-input" type="email" placeholder="name@company.com" style="flex: 1 1 220px; width: auto">
        <button type="submit" class="vin-btn">Send invite</button>
      </form>
      <hr class="vin-separator">
      <ul style="display: grid; gap: 16px; margin: 0; padding: 0; list-style: none">
        <li style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
          <span class="vin-avatar" role="img" aria-label="Meera Iyer"><span class="vin-avatar__fallback">MI</span></span>
          <div style="flex: 1 1 160px; min-width: 0">
            <p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Meera Iyer <span class="vin-badge">You</span></p>
            <p class="vin-small" style="margin: 0; color: var(--vin-muted)">meera@example.com</p>
          </div>
          <select class="vin-input vin-input--sm vin-native-select" aria-label="Role for Meera Iyer" style="width: auto">
            <option>Owner</option>
            <option>Admin</option>
            <option>Member</option>
          </select>
        </li>
        <li style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
          <span class="vin-avatar" role="img" aria-label="Arjun Das"><span class="vin-avatar__fallback">AD</span></span>
          <div style="flex: 1 1 160px; min-width: 0">
            <p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Arjun Das</p>
            <p class="vin-small" style="margin: 0; color: var(--vin-muted)">arjun@example.com</p>
          </div>
          <select class="vin-input vin-input--sm vin-native-select" aria-label="Role for Arjun Das" style="width: auto">
            <option>Admin</option>
            <option>Member</option>
            <option>Owner</option>
          </select>
        </li>
        <li style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
          <span class="vin-avatar" role="img" aria-label="Lena Fischer"><span class="vin-avatar__fallback">LF</span></span>
          <div style="flex: 1 1 160px; min-width: 0">
            <p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Lena Fischer <span class="vin-badge vin-badge--warning">Invited</span></p>
            <p class="vin-small" style="margin: 0; color: var(--vin-muted)">lena@example.com</p>
          </div>
          <select class="vin-input vin-input--sm vin-native-select" aria-label="Role for Lena Fischer" style="width: auto">
            <option>Member</option>
            <option>Admin</option>
            <option>Owner</option>
          </select>
        </li>
      </ul>
    </div>
  </div>
</section>
