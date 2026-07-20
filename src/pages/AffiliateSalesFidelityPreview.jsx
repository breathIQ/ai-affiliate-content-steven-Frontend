import { Link } from "react-router-dom";
import "./AffiliateSalesFidelityPreview.css";

export default function AffiliateSalesFidelityPreview() {
  return (
    <div className="fidelity-page">
      <header className="fidelity-header">
        <Link className="fidelity-logo" to="/affiliate-sales-fidelity-preview">CO₂BODY</Link>
        <span className="fidelity-status">HTML fidelity prototype</span>
        <Link className="fidelity-header-cta" to="/signup">Start creating</Link>
      </header>

      <main>
        <section className="fidelity-hero" aria-labelledby="fidelity-title">
          <div className="fidelity-hero-art" style={{ backgroundImage: "url('/images/affiliate-sales/0.png')" }} role="img" aria-label="The Carbonated Body book with CO2Body content previews" />
          <div className="fidelity-hero-copy">
            <p className="fidelity-kicker">CO2Body Affiliate Platform</p>
            <h1 id="fidelity-title">Share Science That<br />Actually Changes Lives.<br /><em>Get Paid to Do It.</em></h1>
            <div className="fidelity-rule" />
            <p className="fidelity-lede">CO2Body turns 20 years of CO₂ research, and a book that took years to write, into ready-to-post content for your audience. Images, carousels, avatar videos, full automation campaigns. You pick the topic. The system does the rest. Your affiliate link is built into everything.</p>
            <Link className="fidelity-primary-cta" to="/signup">Start Creating → Get Your Affiliate Link</Link>
            <p className="fidelity-proof"><span aria-hidden="true">✓</span> No content skills needed. No editing software.<br />No “AI slop.” Every post is grounded in a genuinely original way of looking at health.</p>
          </div>
        </section>

        <section className="fidelity-problem" aria-labelledby="problem-title">
          <div className="fidelity-problem-art" style={{ backgroundImage: "url('/images/affiliate-sales/1.png')" }} role="img" aria-label="A creator overwhelmed by repetitive health content" />
          <div className="fidelity-problem-copy">
            <p className="fidelity-section-label">1. The Problem</p>
            <h2 id="problem-title">You want to share content that matters. But creating it is a <em>full-time job.</em></h2>
            <div className="fidelity-point">
              <span className="fidelity-icon" aria-hidden="true">01</span>
              <p>You’ve seen what passes for health content online: recycled clickbait, generic AI filler, the same ten “hacks” rephrased forever. Most of it isn’t saying anything new.</p>
            </div>
            <div className="fidelity-point">
              <span className="fidelity-icon" aria-hidden="true">02</span>
              <p>Creating something genuinely good takes <strong>hours per post</strong>: research, accuracy, design, and formatting for every platform. Most people give up.</p>
            </div>
            <p className="fidelity-problem-close"><strong>The slop wins.</strong><br />CO2Body was built to flip that—and give you something to say that no one else is saying.</p>
          </div>
          <p className="fidelity-banner">Stop losing hours. Start sharing what <em>actually matters.</em></p>
        </section>

        <section className="fidelity-note" aria-label="Prototype scope">
          <p>These two sections demonstrate the conversion method: approved artwork, masked embedded copy, and selectable HTML text in the same composition.</p>
          <Link to="/affiliate-sales-preview">View the unchanged image-led page →</Link>
        </section>
      </main>
    </div>
  );
}
