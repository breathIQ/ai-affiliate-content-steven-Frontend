import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AffiliateSalesPreview.css";

const sections = [
  "CO2Body affiliate platform",
  "The problem",
  "What's behind the content",
  "A different lens on health",
  "How it works",
  "Automation campaigns",
  "We market to your referrals",
  "Who this is for",
  "Why creators love the system",
  "What makes this different",
  "Frequently asked questions",
  "Get your affiliate link",
];

export default function AffiliateSalesPreview() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="affiliate-sales-page">
      <a className="sales-skip-link" href="#sales-content">Skip to content</a>

      <header className="sales-header">
        <Link className="sales-brand" to="/affiliate-sales-preview" aria-label="CO2Body affiliate sales page">
          <span className="sales-brand-mark" aria-hidden="true">CO₂</span>
          <span>CO2Body</span>
        </Link>
        <nav className="sales-nav" aria-label="Sales page navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <Link className="sales-sign-in" to="/login">Sign in</Link>
          <Link className="sales-header-cta" to="/signup">Start creating</Link>
        </nav>
        <div className="sales-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </header>

      <main id="sales-content" className="sales-gallery">
        {sections.map((label, index) => (
          <section
            className={`sales-panel sales-panel-${index}`}
            id={index === 4 ? "how-it-works" : index === 10 ? "faq" : undefined}
            key={label}
            aria-label={label}
          >
            <div className="sales-image-frame">
              <img
                className="sales-desktop-image"
                src={`/images/affiliate-sales/${index}.png`}
                alt={`CO2Body sales page: ${label}`}
                width={index === 0 ? 1672 : 1536}
                height={index === 0 ? 941 : 1024}
                loading={index < 2 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
            </div>
            <div className="sales-mobile-slices" aria-hidden="true">
              <div className="sales-mobile-slice sales-mobile-slice-left">
                <img src={`/images/affiliate-sales/${index}.png`} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
              </div>
              <div className="sales-mobile-slice sales-mobile-slice-right">
                <img src={`/images/affiliate-sales/${index}.png`} alt="" loading="lazy" decoding="async" />
              </div>
            </div>
          </section>
        ))}
      </main>

      <footer className="sales-footer">
        <div>
          <span className="sales-footer-brand">CO2Body</span>
          <p>CO₂ and the hidden science of vitality, resilience, and lifelong energy.</p>
        </div>
        <div className="sales-footer-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/login">Sign in</Link>
        </div>
      </footer>

      <Link className="sales-floating-cta" to="/signup" aria-label="Get your affiliate link and start creating">
        <span>Get your affiliate link</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
