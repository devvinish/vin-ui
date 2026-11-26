<!-- VinUI block: Contact. Needs vin.css. -->
<template>
  <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 32px 48px; padding: 48px 16px; max-width: 1000px; margin: 0 auto; align-items: start">
    <div style="display: grid; gap: 22px">
      <div style="display: grid; gap: 10px">
        <h2 class="vin-h2" style="margin: 0">Get in touch</h2>
        <p class="vin-muted" style="margin: 0">Questions about pricing, a demo or a partnership? We answer every message within one working day.</p>
      </div>
      <ul style="display: grid; gap: 16px; margin: 0; padding: 0; list-style: none">
        <li style="display: flex; gap: 12px; align-items: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; margin-top: 3px"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg><div><p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Email</p><a class="vin-link vin-small" href="mailto:hello@example.com">hello@example.com</a></div></li>
        <li style="display: flex; gap: 12px; align-items: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; margin-top: 3px"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg><div><p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Phone</p><p class="vin-small" style="margin: 0; color: var(--vin-muted)">+91 80 4000 1234, Monday to Friday</p></div></li>
        <li style="display: flex; gap: 12px; align-items: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; margin-top: 3px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><div><p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Office</p><p class="vin-small" style="margin: 0; color: var(--vin-muted)">12 MG Road, Bengaluru 560001</p></div></li>
      </ul>
    </div>
    <form class="vin-card">
      <div class="vin-card__body" style="display: grid; gap: 16px">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px">
          <div class="vin-field">
            <label class="vin-label" for="contact-01-name">Name</label>
            <input id="contact-01-name" class="vin-input" autocomplete="name" required>
          </div>
          <div class="vin-field">
            <label class="vin-label" for="contact-01-email">Email</label>
            <input id="contact-01-email" class="vin-input" type="email" autocomplete="email" required>
          </div>
        </div>
        <div class="vin-field">
          <label class="vin-label" for="contact-01-topic">Topic</label>
          <select id="contact-01-topic" class="vin-input vin-native-select">
            <option>Pricing</option>
            <option>A demo</option>
            <option>Partnerships</option>
            <option>Something else</option>
          </select>
        </div>
        <div class="vin-field">
          <label class="vin-label" for="contact-01-message">Message</label>
          <textarea id="contact-01-message" class="vin-input vin-textarea" rows="4" required></textarea>
        </div>
      </div>
      <div class="vin-card__footer"><button type="submit" class="vin-btn">Send message</button></div>
    </form>
  </section>
</template>
