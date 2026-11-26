<!-- VinUI block: Reset password. Needs vin.css. -->
<template>
  <section style="display: grid; place-items: center; padding: 48px 16px">
    <div class="vin-card" style="width: 100%; max-width: 380px">
      <div class="vin-card__header">
        <h2 class="vin-card__title">Reset your password</h2>
        <p class="vin-card__desc">We'll email you a link to choose a new one.</p>
      </div>
      <div class="vin-card__body">
        <form style="display: grid; gap: 16px">
          <div class="vin-field">
            <label class="vin-label" for="forgot-01-email">Email</label>
            <input id="forgot-01-email" class="vin-input" type="email" placeholder="you@example.com" autocomplete="email" aria-describedby="forgot-01-hint" required>
            <p class="vin-hint" id="forgot-01-hint">Use the address you signed up with.</p>
          </div>
          <button type="submit" class="vin-btn">Send reset link</button>
        </form>
      </div>
      <div class="vin-card__footer" style="justify-content: center; padding-bottom: 4px">
        <a class="vin-link vin-small" href="/login">Back to sign in</a>
      </div>
    </div>
  </section>
</template>
