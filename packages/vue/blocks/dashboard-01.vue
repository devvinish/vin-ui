<!-- VinUI block: Dashboard. Needs vin.css and the Chart component. -->
<script setup lang="ts">
import Chart from "@/components/vin/chart.vue";

const visitors = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];
</script>

<template>
  <section style="display: flex; flex-wrap: wrap; min-height: 640px; border-radius: var(--vin-radius-lg); overflow: hidden; background: var(--vin-bg)">
    <nav aria-label="Dashboard" style="flex: 1 1 200px; max-width: 100%; display: grid; align-content: start; gap: 4px; padding: 20px 12px; background: var(--vin-surface); border-inline-end: 1px solid var(--vin-border)">
      <p style="margin: 0 0 12px; padding: 0 10px; font-weight: var(--vin-title-weight)">Acme Inc.</p>
      <a class="vin-btn vin-btn--secondary" href="/dashboard" aria-current="page" style="justify-content: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/></svg>Overview</a>
      <a class="vin-btn vin-btn--ghost" href="/orders" style="justify-content: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>Orders</a>
      <a class="vin-btn vin-btn--ghost" href="/customers" style="justify-content: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>Customers</a>
      <a class="vin-btn vin-btn--ghost" href="/reports" style="justify-content: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/></svg>Reports</a>
      <a class="vin-btn vin-btn--ghost" href="/settings" style="justify-content: flex-start"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>Settings</a>
    </nav>
    <div style="flex: 999 1 560px; min-width: 0; display: grid; align-content: start; gap: 20px; padding: 24px clamp(16px, 3vw, 32px)">
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px">
        <div>
          <h2 class="vin-h3" style="margin: 0">Overview</h2>
          <p class="vin-muted" style="margin: 2px 0 0">January to June</p>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px">
          <button type="button" class="vin-btn vin-btn--outline"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>Export</button>
          <button type="button" class="vin-btn"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>New order</button>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px">
        <div class="vin-card">
          <div class="vin-card__body" style="display: grid; gap: 6px; padding-bottom: 4px">
            <p class="vin-small" style="margin: 0; color: var(--vin-muted)">Revenue</p>
            <p style="margin: 0; font-size: 26px; font-weight: var(--vin-title-weight); line-height: 1.1">₹4,52,310</p>
            <p class="vin-small" style="margin: 0"><span class="vin-badge vin-badge--success">+12.5%</span> <span style="color: var(--vin-muted)">this month</span></p>
          </div>
        </div>
        <div class="vin-card">
          <div class="vin-card__body" style="display: grid; gap: 6px; padding-bottom: 4px">
            <p class="vin-small" style="margin: 0; color: var(--vin-muted)">Orders</p>
            <p style="margin: 0; font-size: 26px; font-weight: var(--vin-title-weight); line-height: 1.1">1,284</p>
            <p class="vin-small" style="margin: 0"><span class="vin-badge vin-badge--success">+8.1%</span> <span style="color: var(--vin-muted)">this month</span></p>
          </div>
        </div>
        <div class="vin-card">
          <div class="vin-card__body" style="display: grid; gap: 6px; padding-bottom: 4px">
            <p class="vin-small" style="margin: 0; color: var(--vin-muted)">New customers</p>
            <p style="margin: 0; font-size: 26px; font-weight: var(--vin-title-weight); line-height: 1.1">342</p>
            <p class="vin-small" style="margin: 0"><span class="vin-badge vin-badge--danger">−3.2%</span> <span style="color: var(--vin-muted)">this month</span></p>
          </div>
        </div>
        <div class="vin-card">
          <div class="vin-card__body" style="display: grid; gap: 6px; padding-bottom: 4px">
            <p class="vin-small" style="margin: 0; color: var(--vin-muted)">Refunds</p>
            <p style="margin: 0; font-size: 26px; font-weight: var(--vin-title-weight); line-height: 1.1">12</p>
            <p class="vin-small" style="margin: 0"><span class="vin-badge">0%</span> <span style="color: var(--vin-muted)">this month</span></p>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 14px">
        <div class="vin-card" style="flex: 2 1 380px; min-width: 0">
          <div class="vin-card__header">
            <h3 class="vin-card__title">Visitors</h3>
            <p class="vin-card__desc">Desktop and mobile, stacked.</p>
          </div>
          <div class="vin-card__body" style="padding-bottom: 4px">
            <Chart
              type="area"
              stacked
              curve="smooth"
              label="Visitors by device, January to June"
              :data="visitors"
              index="month"
              index-label="Month"
              :series="[{ key: 'desktop', label: 'Desktop' }, { key: 'mobile', label: 'Mobile' }]"
            />
          </div>
        </div>
        <div class="vin-card" style="flex: 1 1 260px; min-width: 0">
          <div class="vin-card__header">
            <h3 class="vin-card__title">Recent sales</h3>
            <p class="vin-card__desc">32 sales this week.</p>
          </div>
          <div class="vin-card__body" style="display: grid; gap: 14px; padding-bottom: 4px">
            <div style="display: flex; align-items: center; gap: 12px">
              <span class="vin-avatar" role="img" aria-label="Ananya Rao"><span class="vin-avatar__fallback">AR</span></span>
              <div style="flex: 1; min-width: 0"><p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Ananya Rao</p><p class="vin-small" style="margin: 0; color: var(--vin-muted)">ananya@example.com</p></div>
              <span class="vin-small" style="font-weight: var(--vin-title-weight)">₹19,990</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px">
              <span class="vin-avatar" role="img" aria-label="Rahul Mehta"><span class="vin-avatar__fallback">RM</span></span>
              <div style="flex: 1; min-width: 0"><p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Rahul Mehta</p><p class="vin-small" style="margin: 0; color: var(--vin-muted)">rahul@example.com</p></div>
              <span class="vin-small" style="font-weight: var(--vin-title-weight)">₹3,900</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px">
              <span class="vin-avatar" role="img" aria-label="Sara Khan"><span class="vin-avatar__fallback">SK</span></span>
              <div style="flex: 1; min-width: 0"><p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Sara Khan</p><p class="vin-small" style="margin: 0; color: var(--vin-muted)">sara@example.com</p></div>
              <span class="vin-small" style="font-weight: var(--vin-title-weight)">₹29,000</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px">
              <span class="vin-avatar" role="img" aria-label="Daniel Joseph"><span class="vin-avatar__fallback">DJ</span></span>
              <div style="flex: 1; min-width: 0"><p class="vin-small" style="margin: 0; font-weight: var(--vin-title-weight)">Daniel Joseph</p><p class="vin-small" style="margin: 0; color: var(--vin-muted)">daniel@example.com</p></div>
              <span class="vin-small" style="font-weight: var(--vin-title-weight)">₹990</span>
            </div>
          </div>
        </div>
      </div>
      <div class="vin-table-wrap" role="region" aria-label="Latest orders" tabindex="0">
        <table class="vin-table">
          <caption class="vin-table__caption">Latest orders</caption>
          <thead>
            <tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col" class="vin-table__num">Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>#3210</td><td>Ananya Rao</td><td><span class="vin-badge vin-badge--success">Paid</span></td><td class="vin-table__num">₹19,990</td></tr>
            <tr><td>#3209</td><td>Rahul Mehta</td><td><span class="vin-badge vin-badge--warning">Pending</span></td><td class="vin-table__num">₹3,900</td></tr>
            <tr><td>#3208</td><td>Sara Khan</td><td><span class="vin-badge vin-badge--success">Paid</span></td><td class="vin-table__num">₹29,000</td></tr>
            <tr><td>#3207</td><td>Daniel Joseph</td><td><span class="vin-badge vin-badge--danger">Refunded</span></td><td class="vin-table__num">₹990</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
