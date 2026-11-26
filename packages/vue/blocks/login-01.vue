<!-- VinUI block: Sign in. Needs vin.css. -->
<template>
  <section style="display: grid; place-items: center; padding: 48px 16px">
    <div class="vin-card" style="width: 100%; max-width: 380px">
      <div class="vin-card__header">
        <h2 class="vin-card__title">Sign in to your account</h2>
        <p class="vin-card__desc">Enter your email and password to continue.</p>
      </div>
      <div class="vin-card__body">
        <form style="display: grid; gap: 16px">
          <div class="vin-field">
            <label class="vin-label" for="login-01-email">Email</label>
            <input id="login-01-email" class="vin-input" type="email" placeholder="you@example.com" autocomplete="email" required>
          </div>
          <div class="vin-field">
            <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px">
              <label class="vin-label" for="login-01-password">Password</label>
              <a class="vin-link vin-small" href="/forgot-password">Forgot password?</a>
            </div>
            <input id="login-01-password" class="vin-input" type="password" autocomplete="current-password" required>
          </div>
          <div class="vin-choice">
            <input id="login-01-remember" class="vin-checkbox" type="checkbox">
            <div class="vin-choice__body"><label class="vin-choice__label" for="login-01-remember">Keep me signed in</label></div>
          </div>
          <button type="submit" class="vin-btn">Sign in</button>
          <button type="button" class="vin-btn vin-btn--outline">Sign in with a passkey</button>
        </form>
      </div>
      <div class="vin-card__footer" style="justify-content: center; padding-bottom: 4px">
        <p class="vin-small" style="margin: 0">No account yet? <a class="vin-link" href="/signup">Create one</a></p>
      </div>
    </div>
  </section>
</template>
