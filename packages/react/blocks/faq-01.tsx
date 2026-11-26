/* VinUI block: FAQ. Needs vin.css. */
export function Faq01() {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "32px 48px", padding: "48px 16px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "grid", alignContent: "start", gap: "12px" }}>
        <h2 className="vin-h2" style={{ margin: "0" }}>Questions and answers</h2>
        <p className="vin-muted" style={{ margin: "0" }}>Can't find what you need? <a className="vin-link" href="/contact">Write to us</a> and we'll reply within a day.</p>
      </div>
      <div className="vin-accordion">
        <details className="vin-accordion__item" name="faq-01" open>
          <summary className="vin-accordion__trigger">Is there a free plan?</summary>
          <div className="vin-accordion__content">Yes. The Free plan has one project and up to three people, with no time limit.</div>
        </details>
        <details className="vin-accordion__item" name="faq-01">
          <summary className="vin-accordion__trigger">Can I change plans later?</summary>
          <div className="vin-accordion__content">Any time. Upgrades start straight away; downgrades start at the next billing date.</div>
        </details>
        <details className="vin-accordion__item" name="faq-01">
          <summary className="vin-accordion__trigger">Do you offer refunds?</summary>
          <div className="vin-accordion__content">If you're not happy in the first 30 days, we'll refund the full amount.</div>
        </details>
        <details className="vin-accordion__item" name="faq-01">
          <summary className="vin-accordion__trigger">Where is my data stored?</summary>
          <div className="vin-accordion__content">In data centres in the region you choose when you sign up, encrypted at rest and in transit.</div>
        </details>
      </div>
    </section>
  );
}
