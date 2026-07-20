import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AffiliateSalesPreview.css";

const features = [
  ["20 years of dedicated research", "How carbon dioxide affects oxygen delivery, breathing, energy, sleep, circulation, and long-term health."],
  ["A complete book", "The Carbonated Body was written over several years. Chapter by chapter, it is the source material the system uses."],
  ["New research every week", "Each article is thought through, sourced, and written to teach something real, so your content never runs dry."],
];

const formats = [
  ["Image posts", "Striking, on-message visuals in six one-click design styles."],
  ["Carousel posts", "Multi-slide educational sequences you can reorder exactly how you want."],
  ["Image-to-video", "Turn any generated image into motion with one click."],
  ["Avatar videos", "Choose a realistic presenter or create your own avatar from one selfie."],
];

const comparison = [
  ["Here’s a link, good luck", "Full content engine + marketing team behind you"],
  ["You create all content yourself", "Images, carousels, and videos generated from real research"],
  ["Generic AI content", "An original, terrain-first perspective"],
  ["Post manually every day", "Automation campaigns publish for you"],
  ["One click, one chance", "Email and retargeting convert referrals for weeks"],
  ["Nothing for your audience", "An exclusive discount only you can give"],
];

const faqs = [
  ["Is this just AI-generated content?", "The AI handles formatting, writing, design, and video production. The substance comes from 20 years of research, a complete book, and new researched articles every week."],
  ["I’ve never made content before. Can I actually do this?", "If you can click a button and pick a topic, yes. With automation campaigns, even the clicking becomes optional."],
  ["What if I don’t like what it generates?", "Regenerate it, keep the image, reorder the carousel, or edit before publishing. Every generation is saved automatically."],
  ["Do I have to be on camera?", "Never. The avatars present for you, or you can create an avatar of yourself from one selfie."],
  ["How do I actually get paid?", "Your personal affiliate link tracks referrals through their first visit, email campaigns, retargeting ads, and purchase."],
  ["What does it cost?", "CO2Body uses simple prepaid credits. You pay only for what you generate and can enable automatic top-ups."],
];

function Art({ number, position = "center" }) {
  return (
    <figure className="sales-art" aria-hidden="true">
      <img src={`/images/affiliate-sales/${number}.png`} alt="" loading={number < 2 ? "eager" : "lazy"} decoding="async" style={{ objectPosition: position }} />
    </figure>
  );
}

function Section({ number, eyebrow, title, children, reverse = false, id }) {
  return (
    <section className={`sales-copy-section${reverse ? " is-reverse" : ""}`} id={id}>
      <div className="sales-copy">
        <p className="sales-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {children}
      </div>
      <Art number={number} />
    </section>
  );
}

export default function AffiliateSalesPreview() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="affiliate-sales-page">
      <a className="sales-skip-link" href="#sales-content">Skip to content</a>
      <header className="sales-header">
        <Link className="sales-brand" to="/affiliate-sales-preview"><span className="sales-brand-mark">CO₂</span><span>CO2Body</span></Link>
        <nav className="sales-nav" aria-label="Sales page navigation">
          <a href="#how-it-works">How it works</a><a href="#faq">FAQ</a><Link className="sales-sign-in" to="/login">Sign in</Link><Link className="sales-header-cta" to="/signup">Start creating</Link>
        </nav>
        <div className="sales-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      </header>

      <main id="sales-content">
        <section className="sales-hero">
          <div className="sales-copy">
            <p className="sales-eyebrow">CO2Body affiliate platform</p>
            <h1>Share science that actually changes lives. <span>Get paid to do it.</span></h1>
            <p className="sales-lead">CO2Body turns 20 years of CO₂ research—and a book that took years to write—into ready-to-post content for your audience. Images, carousels, avatar videos, and full automation campaigns. You pick the topic. The system does the rest.</p>
            <Link className="sales-primary-cta" to="/signup">Start creating <span aria-hidden="true">→</span></Link>
            <p className="sales-trust">No content skills needed. No editing software. No “AI slop.” Every post is grounded in a genuinely original way of looking at health.</p>
          </div>
          <Art number={0} position="right" />
        </section>

        <Section number={1} eyebrow="The problem" title="You want to share content that matters. But creating it is a full-time job." reverse>
          <p>You’ve seen what passes for health content online: recycled clickbait, generic AI filler, and the same ten “hacks” rephrased forever. It looks shallow because it is saying nothing new.</p>
          <p>Creating something genuinely good takes hours per post: research, accuracy, design, and formatting for every platform. Most people give up. The slop wins.</p>
        </Section>

        <Section number={2} eyebrow="What’s behind the content" title="This isn’t a content farm. It’s an original way of seeing the body, with a publishing engine attached.">
          <p>Every piece of content CO2Body generates is drawn from a real body of work:</p>
          <div className="sales-card-list">{features.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
          <p className="sales-callout">AI tools generate content <em>about</em> a topic. CO2Body generates content <em>from</em> a life’s work.</p>
        </Section>

        <Section number={3} eyebrow="A different lens on health" title="Most health content asks what’s wrong. We ask what made it possible." reverse>
          <p>The Carbonated Body sees the body as a living environment, not a collection of broken parts.</p>
          <div className="sales-card-list"><article><h3>Terrain, structure, and flow</h3><p>Disease is the visible consequence of losing the conditions that keep cells oxygenated, fueled, and able to repair.</p></article><article><h3>Supply is not delivery</h3><p>Having oxygen in your blood is not the same as getting it into the cell.</p></article><article><h3>CO₂ is the forgotten coordinator</h3><p>It governs oxygen release, blood flow to the smallest vessels, and systemic balance.</p></article></div>
        </Section>

        <Section number={4} eyebrow="How it works" title="From “I should post something” to published, in minutes." id="how-it-works">
          <ol className="sales-steps"><li><strong>Pick your source.</strong><span>Choose a book chapter or research topic.</span></li><li><strong>Choose your format.</strong><span>Select any format below with one click.</span></li><li><strong>Publish—or don’t even do that.</strong><span>Post now, schedule it, or let the system publish automatically.</span></li></ol>
          <div className="sales-format-grid">{formats.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        </Section>

        <Section number={5} eyebrow="Automation campaigns" title="The “set it and forget it” mode." reverse>
          <p>Build a day-by-day campaign—carousel, avatar video, image-to-video, product promotion—and turn it on.</p>
          <ul className="sales-check-list"><li>Content generates itself on schedule</li><li>Scripts are written automatically from the research</li><li>Posts publish themselves to connected accounts</li><li>Your affiliate link rides along on every piece</li></ul>
          <p className="sales-callout">Build the campaign once. The system runs it every day without you.</p>
        </Section>

        <Section number={6} eyebrow="We market to your referrals" title="Most affiliate programs hand you a link and wish you luck. We do the selling with you.">
          <div className="sales-card-list"><article><h3>Done-for-you email marketing</h3><p>Visitors enter professionally written campaigns that educate, build trust, and convert over time.</p></article><article><h3>Your own exclusive discount</h3><p>Give followers a special coupon they cannot get anywhere else.</p></article><article><h3>Retargeting credited to you</h3><p>We bring referred visitors back. When they convert, you still receive credit.</p></article><article><h3>Special tracked links</h3><p>Your URL is displayed in images, shown on video, and spoken aloud by avatars.</p></article></div>
        </Section>

        <Section number={7} eyebrow="Who this is for" title="This works if you believe in the mission. That’s the only real requirement." reverse>
          <ul className="sales-check-list"><li>You have followers who trust you</li><li>You work in health, breathwork, fitness, biohacking, or wellness</li><li>The terrain-first perspective resonates with you</li><li>You want to help friends and family understand this</li></ul>
          <p>You do not need to be a scientist, video editor, or marketer. The research is done, the perspective is developed, and the system is built.</p>
        </Section>

        <Section number={8} eyebrow="Why creators love it" title="Content that stays fresh. Credibility that compounds.">
          <div className="sales-card-list"><article><h3>You never run out of content</h3><p>Thirty-three chapters, multiple angles per chapter, and new research every week.</p></article><article><h3>You stay credible</h3><p>Educational, not salesy. Grounded in a published book and framed as ideas worth sharing.</p></article><article><h3>You control your voice</h3><p>Edit captions, add experience, link reviews, and make every idea yours.</p></article><article><h3>You earn from alignment</h3><p>Share ideas you believe in and earn when your audience takes the next step.</p></article></div>
        </Section>

        <section className="sales-wide-section">
          <p className="sales-eyebrow">What makes this different</p><h2>Not just a link. A complete system built to help you win.</h2>
          <div className="sales-comparison"><div className="sales-comparison-head"><span>Typical affiliate program</span><span>CO2Body</span></div>{comparison.map(([before, after]) => <div className="sales-comparison-row" key={before}><span>{before}</span><strong>{after}</strong></div>)}</div>
          <Art number={9} />
        </section>

        <section className="sales-wide-section" id="faq">
          <p className="sales-eyebrow">Frequently asked questions</p><h2>Questions? Here’s the straight answer.</h2>
          <div className="sales-faq">{faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="sales-final-cta">
          <div><p className="sales-eyebrow">Ready to share something meaningful?</p><h2>The research took 20 years. Sharing it takes 5 minutes.</h2><p>A genuinely original perspective. Beautiful content. A marketing team working your leads. Income from every person you bring in.</p><Link className="sales-primary-cta" to="/signup">Get your affiliate link + start creating <span aria-hidden="true">→</span></Link></div>
          <Art number={11} position="center" />
        </section>
      </main>

      <footer className="sales-footer"><div><span className="sales-footer-brand">CO2Body</span><p>CO₂ and the hidden science of vitality, resilience, and lifelong energy.</p></div><div className="sales-footer-links"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/login">Sign in</Link></div></footer>
      <Link className="sales-floating-cta" to="/signup"><span>Get your affiliate link</span><span aria-hidden="true">→</span></Link>
    </div>
  );
}
