<!-- VinUI block: Sign in, split screen. Needs vin.css. -->
<section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); min-height: 520px; border-radius: var(--vin-radius-lg); overflow: hidden; background: var(--vin-surface)">
  <div style="display: grid; align-content: center; gap: 24px; padding: 48px clamp(20px, 6vw, 64px)">
    <div style="display: grid; gap: 6px">
      <h2 class="vin-h3" style="margin: 0">Welcome back</h2>
      <p class="vin-muted" style="margin: 0">Sign in to pick up where you left off.</p>
    </div>
    <form style="display: grid; gap: 16px">
      <div class="vin-field">
        <label class="vin-label" for="login-02-email">Email</label>
        <input id="login-02-email" class="vin-input" type="email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div class="vin-field">
        <label class="vin-label" for="login-02-password">Password</label>
        <input id="login-02-password" class="vin-input" type="password" autocomplete="current-password" required>
      </div>
      <button type="submit" class="vin-btn">Sign in</button>
    </form>
    <hr class="vin-separator">
    <p class="vin-small" style="margin: 0">New here? <a class="vin-link" href="/signup">Create an account</a></p>
  </div>
  <div style="display: grid; align-content: space-between; gap: 32px; padding: 48px clamp(20px, 6vw, 64px); color: var(--vin-accent-fg); background: var(--vin-accent)">
    <p style="margin: 0; font-weight: var(--vin-title-weight); font-size: var(--vin-text-lg)">Acme Inc.</p>
    <blockquote style="margin: 0; display: grid; gap: 14px">
      <p style="margin: 0; font-size: calc(var(--vin-text-lg) + 4px); line-height: 1.45">“We moved our whole dashboard over in a weekend. It finally looks like one product.”</p>
      <footer style="font-size: var(--vin-text-sm)">Priya Nair, Head of Product</footer>
    </blockquote>
  </div>
</section>
