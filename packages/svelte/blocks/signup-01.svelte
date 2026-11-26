<!-- VinUI block: Create account. Needs vin.css. -->
<section style="display: grid; place-items: center; padding: 48px 16px">
  <div class="vin-card" style="width: 100%; max-width: 420px">
    <div class="vin-card__header">
      <h2 class="vin-card__title">Create your account</h2>
      <p class="vin-card__desc">Free for 14 days. No card needed.</p>
    </div>
    <div class="vin-card__body">
      <form style="display: grid; gap: 16px">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px">
          <div class="vin-field">
            <label class="vin-label" for="signup-01-first">First name</label>
            <input id="signup-01-first" class="vin-input" autocomplete="given-name" required>
          </div>
          <div class="vin-field">
            <label class="vin-label" for="signup-01-last">Last name</label>
            <input id="signup-01-last" class="vin-input" autocomplete="family-name" required>
          </div>
        </div>
        <div class="vin-field">
          <label class="vin-label" for="signup-01-email">Work email</label>
          <input id="signup-01-email" class="vin-input" type="email" placeholder="you@company.com" autocomplete="email" required>
        </div>
        <div class="vin-field">
          <label class="vin-label" for="signup-01-password">Password</label>
          <input id="signup-01-password" class="vin-input" type="password" autocomplete="new-password" minlength="8" aria-describedby="signup-01-password-hint" required>
          <p class="vin-hint" id="signup-01-password-hint">At least 8 characters.</p>
        </div>
        <div class="vin-choice">
          <input id="signup-01-terms" class="vin-checkbox" type="checkbox" required>
          <div class="vin-choice__body"><label class="vin-choice__label" for="signup-01-terms">I agree to the terms and the privacy policy</label></div>
        </div>
        <button type="submit" class="vin-btn">Create account</button>
      </form>
    </div>
    <div class="vin-card__footer" style="justify-content: center; padding-bottom: 4px">
      <p class="vin-small" style="margin: 0">Already have an account? <a class="vin-link" href="/login">Sign in</a></p>
    </div>
  </div>
</section>
