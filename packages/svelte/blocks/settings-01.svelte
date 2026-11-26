<!-- VinUI block: Profile settings. Needs vin.css. -->
<section style="display: grid; place-items: center; padding: 32px 16px">
  <form class="vin-card" style="width: 100%; max-width: 640px">
    <div class="vin-card__header">
      <h2 class="vin-card__title">Profile</h2>
      <p class="vin-card__desc">This is how others see you on the site.</p>
    </div>
    <div class="vin-card__body" style="display: grid; gap: 18px">
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px">
        <span class="vin-avatar vin-avatar--lg" role="img" aria-label="Meera Iyer"><span class="vin-avatar__fallback">MI</span></span>
        <button type="button" class="vin-btn vin-btn--outline vin-btn--sm">Change photo</button>
        <button type="button" class="vin-btn vin-btn--ghost vin-btn--sm">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px">
        <div class="vin-field">
          <label class="vin-label" for="settings-01-name">Name</label>
          <input id="settings-01-name" class="vin-input" value="Meera Iyer" autocomplete="name">
        </div>
        <div class="vin-field">
          <label class="vin-label" for="settings-01-email">Email</label>
          <input id="settings-01-email" class="vin-input" type="email" value="meera@example.com" autocomplete="email">
        </div>
      </div>
      <div class="vin-field">
        <label class="vin-label" for="settings-01-bio">Bio</label>
        <textarea id="settings-01-bio" class="vin-input vin-textarea" rows="3" placeholder="A line or two about you" aria-describedby="settings-01-bio-hint"></textarea>
        <p class="vin-hint" id="settings-01-bio-hint">Shown on your public profile.</p>
      </div>
      <hr class="vin-separator">
      <fieldset style="display: grid; gap: 14px; margin: 0; padding: 0; border: 0">
        <legend class="vin-label" style="margin-bottom: 12px">Email me about</legend>
        <div class="vin-choice">
          <input id="settings-01-mentions" class="vin-switch" type="checkbox" role="switch" checked>
          <div class="vin-choice__body">
            <label class="vin-choice__label" for="settings-01-mentions">Mentions and replies</label>
            <p class="vin-choice__desc">When someone mentions you or replies to you.</p>
          </div>
        </div>
        <div class="vin-choice">
          <input id="settings-01-digest" class="vin-switch" type="checkbox" role="switch">
          <div class="vin-choice__body">
            <label class="vin-choice__label" for="settings-01-digest">Weekly summary</label>
            <p class="vin-choice__desc">One email every Monday with what changed.</p>
          </div>
        </div>
        <div class="vin-choice">
          <input id="settings-01-product" class="vin-switch" type="checkbox" role="switch" checked>
          <div class="vin-choice__body">
            <label class="vin-choice__label" for="settings-01-product">Product news</label>
            <p class="vin-choice__desc">New features, a few times a year.</p>
          </div>
        </div>
      </fieldset>
    </div>
    <div class="vin-card__footer" style="justify-content: flex-end">
      <button type="button" class="vin-btn vin-btn--ghost">Cancel</button>
      <button type="submit" class="vin-btn">Save changes</button>
    </div>
  </form>
</section>
