// Shared "Ready to ..." banner that sits above the footer on every
// page (homepage + feature pages + pricing). Same JSX everywhere so a
// fix on one page hits all of them. Title is the only thing that varies.
export default function FooterCTA({
  title = 'Ready to meet Roam?',
  sub = 'Give your team an office that thinks. Book a demo or kick the tires for free.',
}) {
  return (
    <div className="fp-footer-cta">
      <div className="fp-footer-cta-inner">
        <div className="fp-footer-cta-lead">
          <img className="fp-footer-cta-icon" src="/icons/roam-gold-icon.png" alt="" />
          <div className="fp-footer-cta-text">
            <h2 className="fp-footer-cta-title">{title}</h2>
            <p className="fp-footer-cta-sub text-body">{sub}</p>
          </div>
        </div>
        <div className="fp-cta-row">
          <button className="sc-promo-btn">Book Demo</button>
          <button className="sc-promo-btn">Free Trial</button>
        </div>
      </div>
    </div>
  );
}
