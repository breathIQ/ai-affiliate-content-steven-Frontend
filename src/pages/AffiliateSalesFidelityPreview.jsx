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

        <section className="fidelity-problem" style={{ "--problem-art": "url('/images/affiliate-sales/1-clean.png')" }} aria-labelledby="problem-title">
          <div className="fidelity-problem-art" style={{ backgroundImage: "url('/images/affiliate-sales/1-clean.png')" }} role="img" aria-label="A creator overwhelmed by repetitive health content" />
          <div className="fidelity-problem-copy">
            <p className="fidelity-section-label">1. The Problem</p>
            <h2 id="problem-title">You want to share content that matters. But creating it is a <em>full-time job.</em></h2>
            <div className="fidelity-point">
              <span className="fidelity-icon fidelity-icon-brain" aria-hidden="true" />
              <p>You’ve seen what passes for health content online: recycled clickbait, generic AI filler, the same ten “hacks” rephrased forever. Most of it doesn’t just look shallow. It’s <strong>saying nothing new</strong>, because it’s all working from the same tired assumptions about how the body works.</p>
            </div>
            <div className="fidelity-point fidelity-point-clock">
              <span className="fidelity-icon fidelity-icon-clock" aria-hidden="true" />
              <p>Meanwhile, creating something genuinely good takes <strong>hours per post</strong>: researching it, getting it accurate, designing it well, and formatting it for every platform. Most people give up.</p>
            </div>
            <div className="fidelity-point fidelity-point-final">
              <span className="fidelity-icon fidelity-icon-trash" aria-hidden="true" />
              <p><strong>The slop wins.</strong><br />CO2Body was built to flip that—and give you something to say that no one else is saying.</p>
            </div>
          </div>
          <p className="fidelity-banner">Stop losing hours. Start sharing what <em>actually matters.</em></p>
        </section>

        <section className="fidelity-source" aria-labelledby="source-title">
          <div className="fidelity-source-art" style={{ backgroundImage: "url('/images/affiliate-sales/2-clean.png')" }} role="img" aria-label="The Carbonated Body book, laboratory glassware, research volumes, and scientific content icons" />
          <div className="fidelity-source-header">
            <p className="fidelity-source-label">2. What’s Behind the Content</p>
            <h2 id="source-title">This isn’t a content farm.<br />It’s <em>an original way</em> of seeing the body,<br />with a publishing engine attached.</h2>
          </div>
          <p className="fidelity-source-intro">Every piece of content <strong>CO2Body</strong> generates is drawn from a real body of work:</p>
          <div className="fidelity-source-points">
            <article>
              <h3>20 years of dedicated research<br />into CO₂ and human physiology.</h3>
              <p>How carbon dioxide affects oxygen delivery, breathing, energy, sleep, circulation, and long-term health.</p>
            </article>
            <article>
              <h3>A complete book, <em>The Carbonated Body</em>,<br />written over several years.</h3>
              <p>Not ghostwritten, not compiled from blog posts. Chapter by chapter, it’s the source material the system pulls from when it writes your posts.</p>
            </article>
            <article>
              <h3>New, fully-researched articles<br />every week.</h3>
              <p>Each one thought through, sourced, and written to teach something real. The library keeps growing, so your content never runs dry.</p>
            </article>
          </div>
          <p className="fidelity-source-insight">When the system writes a caption, a carousel, or an avatar video script, it’s working directly from this material, <strong>whole chapters at a time.</strong> That’s why the output reads like it came from someone who actually knows the subject. <em>Because it did.</em></p>
          <p className="fidelity-source-banner">The difference is simple: AI tools generate content about a topic.<br /><em>CO2Body generates content from a life’s work and an original perspective on the topic.</em></p>
        </section>

        <section className="fidelity-lens" aria-labelledby="lens-title">
          <div className="fidelity-lens-art" style={{ backgroundImage: "url('/images/affiliate-sales/3-clean.png')" }} role="img" aria-label="A terrain-first view of the human body showing CO2, oxygen delivery, circulation, and cellular energy" />
          <div className="fidelity-lens-header">
            <p className="fidelity-lens-label">3. A Different Lens on Health</p>
            <h2 id="lens-title">Most health content asks what’s wrong.<br /><em>We ask what made it possible.</em></h2>
          </div>
          <article className="fidelity-lens-side fidelity-lens-usual">
            <h3>The Usual Lens</h3>
            <p>Looking for what’s broken. Treating symptoms. Managing numbers. Another part to fix.</p>
          </article>
          <article className="fidelity-lens-side fidelity-lens-co2">
            <h3>The CO₂ Lens</h3>
            <p>Understanding the living systems that make health possible. Supporting terrain, structure, and flow so the body can thrive.</p>
          </article>
          <div className="fidelity-lens-points">
            <article>
              <h3>Terrain, structure,<br />and flow.</h3>
              <p>Health isn’t one thing. It’s the environment, the architecture, and the circulation that bring life to every cell.</p>
            </article>
            <article>
              <h3>Supply is<br />not delivery.</h3>
              <p>Oxygen in the air means nothing if it can’t get to where it’s needed and be used by the cells.</p>
            </article>
            <article>
              <h3>CO₂ is the forgotten<br />coordinator.</h3>
              <p>It expands vessels, directs blood flow, unloads oxygen, and powers cellular energy. Without it, nothing else works well.</p>
            </article>
          </div>
          <p className="fidelity-lens-banner">A lens that makes everything else about health <em>make more sense.</em></p>
        </section>

        <section className="fidelity-workflow" aria-labelledby="workflow-title">
          <div className="fidelity-workflow-art" style={{ backgroundImage: "url('/images/affiliate-sales/4-clean.png')" }} role="img" aria-label="CO2Body workflow from book and research through generated formats to published social posts" />
          <div className="fidelity-workflow-header">
            <p>4. How It Works</p>
            <h2 id="workflow-title">From “I should post something”<br /><em>to published, in minutes.</em></h2>
          </div>
          <div className="fidelity-workflow-steps" aria-label="Three publishing steps">
            <h3><em>Step 1</em> — Pick your source.</h3>
            <h3><em>Step 2</em> — Choose your format.</h3>
            <h3><em>Step 3</em> — Publish. Or don’t even do that.</h3>
          </div>
          <p className="fidelity-workflow-banner">Pick a topic. Choose a format. <em>Let the system do the rest.</em></p>
        </section>

        <section className="fidelity-automation" aria-labelledby="automation-title">
          <div className="fidelity-automation-art" style={{ backgroundImage: "url('/images/affiliate-sales/5-clean.png')" }} role="img" aria-label="A four-day automated content campaign connected through the CO2Body campaign engine" />
          <div className="fidelity-automation-header">
            <p>5. Automation Campaigns</p>
            <h2 id="automation-title">The <em>“set it and forget it”</em> mode.</h2>
          </div>
          <p className="fidelity-automation-summary">Build the campaign once. The system runs it every day without you.</p>
          <p className="fidelity-automation-banner">Your accounts stay active. <em>Your audience keeps learning. Your links keep working.</em></p>
        </section>

        <section className="fidelity-referrals" aria-labelledby="referrals-title">
          <div className="fidelity-referrals-art" style={{ backgroundImage: "url('/images/affiliate-sales/6-clean.png')" }} role="img" aria-label="A referral marketing system flowing through email, coupon, retargeting, tracking, and commission" />
          <div className="fidelity-referrals-header">
            <p>6. We Market to Your Referrals for You</p>
            <h2 id="referrals-title">Most affiliate programs hand you a link<br />and wish you luck. <em>We do the selling with you.</em></h2>
          </div>
          <p className="fidelity-referrals-summary">You introduce people to the work.<br /><em>An entire marketing system<br />takes it from there.</em></p>
          <p className="fidelity-referrals-banner">Every conversion it produces <em>lands in your account.</em></p>
        </section>

        <section className="fidelity-audience" aria-labelledby="audience-title">
          <div className="fidelity-audience-art" style={{ backgroundImage: "url('/images/affiliate-sales/7-clean.png')" }} role="img" aria-label="Four kinds of people who can share CO2Body content, with no specialist skills required" />
          <div className="fidelity-audience-header">
            <p>7. Who This Is For</p>
            <h2 id="audience-title">This works if you believe in the mission.<br /><em>That’s the only real requirement.</em></h2>
          </div>
          <p className="fidelity-audience-summary">The research is done. The content engine is built. The marketing team works for you.</p>
          <p className="fidelity-audience-banner">You bring belief in the mission. <em>The system does the rest.</em></p>
        </section>

        <section className="fidelity-benefits" aria-labelledby="benefits-title">
          <div className="fidelity-benefits-art" style={{ backgroundImage: "url('/images/affiliate-sales/8-clean.png')" }} role="img" aria-label="Five creator benefits including content depth, credibility, voice control, authentic advocacy, and scalability" />
          <div className="fidelity-benefits-header">
            <p>8. Why Creators Love This System</p>
            <h2 id="benefits-title">Content that stays fresh.<br /><em>Credibility that compounds.</em></h2>
          </div>
          <div className="fidelity-benefits-strip"><span>Educational, not salesy</span><span>Posting stays effortless</span><span>Commissions compound over time</span></div>
          <p className="fidelity-benefits-banner">You don’t need a huge audience. <em>You need an audience that trusts you.</em></p>
        </section>

        <section className="fidelity-comparison" aria-labelledby="comparison-title">
          <div className="fidelity-comparison-art" style={{ backgroundImage: "url('/images/affiliate-sales/9-clean.png')" }} aria-hidden="true" />
          <div className="fidelity-comparison-header">
            <p>9. What Makes This Different</p>
            <h2 id="comparison-title">What Makes This Different.</h2>
          </div>
          <div className="fidelity-comparison-grid">
            <div className="fidelity-comparison-column fidelity-comparison-typical">
              <h3>Typical Affiliate Program</h3>
              {['Here’s a link. Good luck.', 'Create everything yourself', 'Generic AI content', 'Post manually every day', 'One click. One chance.', 'Nothing for your audience'].map((item) => <p key={item}>{item}</p>)}
            </div>
            <div className="fidelity-comparison-column fidelity-comparison-co2body">
              <h3>CO₂Body</h3>
              {['Content engine + marketing team', 'Images, carousels + videos from real research', 'An original, terrain-first perspective', 'Hands-free automation campaigns', 'Email + retargeting convert for weeks', 'An exclusive discount only you can give'].map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
          <p className="fidelity-comparison-banner">Not just a link. <em>A complete system built to help you win.</em></p>
        </section>

        <section className="fidelity-faq" aria-labelledby="faq-title">
          <div className="fidelity-faq-art" style={{ backgroundImage: "url('/images/affiliate-sales/10-clean.png')" }} aria-hidden="true" />
          <div className="fidelity-faq-header">
            <p>10. Frequently Asked Questions</p>
            <h2 id="faq-title">Questions? <em>Here’s the straight answer.</em></h2>
          </div>
          <div className="fidelity-faq-grid">
            {[
              ['Is this just AI-generated content?', 'AI handles the format. The substance comes from 20 years of research, a complete book, and new researched articles.'],
              ['I’ve never made content before. Can I do this?', 'If you can click a button and pick a topic, yes.'],
              ['What if I don’t like what it generates?', 'Regenerate, keep the image, reorder the carousel, or edit before publishing.'],
              ['Do I have to be on camera?', 'Never. Use a realistic avatar—or create your own from one selfie.'],
              ['How do I get paid?', 'Your affiliate link tracks referrals through visits, email, retargeting, and purchase.'],
              ['What does it cost?', 'Simple prepaid credits. Pay only for what you generate.'],
            ].map(([question, answer]) => (
              <article key={question}><h3>{question}</h3><p>{answer}</p></article>
            ))}
          </div>
          <p className="fidelity-faq-banner">Real research. <em>Simple to use.</em> Always under your control.</p>
        </section>

        <section className="fidelity-cta" aria-labelledby="cta-title">
          <div className="fidelity-cta-art" style={{ backgroundImage: "url('/images/affiliate-sales/11-clean.png')" }} role="img" aria-label="The real Carbonated Body book beside a complete automated affiliate marketing system" />
          <div className="fidelity-cta-header">
            <h2 id="cta-title">The research took 20 years.<br /><em>Sharing it takes 5 minutes.</em></h2>
            <p>A genuinely original perspective. Beautiful content.<br />A marketing team working your leads. Income from every person you bring in.</p>
          </div>
          <div className="fidelity-cta-action">
            <Link to="/signup">Get your affiliate link + start creating <span aria-hidden="true">→</span></Link>
            <p>Give your followers an exclusive affiliate-only discount.</p>
          </div>
          <p className="fidelity-cta-banner">Share better science. Build trust. Get paid to do it.</p>
        </section>

        <section className="fidelity-note" aria-label="Prototype scope">
          <p>These sections demonstrate the conversion method: approved artwork, preserved visual assets, and selectable HTML text in the same composition.</p>
          <Link to="/affiliate-sales-preview">View the unchanged image-led page →</Link>
        </section>
      </main>
      <Link className="fidelity-floating-cta" to="/signup">
        Get your affiliate link <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
