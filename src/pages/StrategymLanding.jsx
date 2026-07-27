import { useEffect } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiMessageSquare,
  FiMessageCircle,
  FiPhone,
  FiPower,
  FiRefreshCw,
  FiSettings,
  FiStar,
  FiTrendingUp,
  FiUploadCloud,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import "./StrategymLanding.css";

const reviewBenefits = [
  {
    icon: FiMessageSquare,
    title: "Get More Reviews",
    body: "Automatically invite happy customers to leave a review.",
  },
  {
    icon: FiTrendingUp,
    title: "Boost Your Rankings",
    body: "More quality reviews help you rank higher on Google.",
  },
  {
    icon: FiPhone,
    title: "Get More Calls",
    body: "Higher rankings mean more visibility and more customers.",
  },
];

const followUps = [
  { icon: FiUserPlus, label: "New Lead Follow-Up" },
  { icon: FiDollarSign, label: "Estimate Reminders" },
  { icon: FiStar, label: "Review Requests" },
  { icon: FiUsers, label: "Referral Campaigns" },
  { icon: FiCalendar, label: "Repeat Service Reminders" },
  { icon: FiRefreshCw, label: "Win Back Past Customers" },
];

const pipeline = [
  { icon: FiUserPlus, title: "New Lead", text: "New inquiry captured" },
  { icon: FiDollarSign, title: "Estimate Sent", text: "Estimate delivered instantly" },
  { icon: FiCalendar, title: "Appointment Scheduled", text: "Customer books with ease" },
  { icon: FiCheckCircle, title: "Job Completed", text: "Work completed successfully" },
  { icon: FiStar, title: "Review Received", text: "5-star review generated" },
  { icon: FiUsers, title: "Referral", text: "Happy customers refer others" },
  { icon: FiRefreshCw, title: "Repeat Service Reminder", text: "Stay top of mind" },
];

const setupSteps = [
  {
    icon: FiUploadCloud,
    title: "Connect Your Customer List",
    body: "Import your contacts or connect your existing software.",
    items: ["CSV", "CRM", "Google Sheets", "Website Leads"],
  },
  {
    icon: FiSettings,
    title: "Select Your Automations",
    body: "Choose which follow-up campaigns you want to run.",
    items: [
      "Review Requests",
      "Estimate Follow-ups",
      "Missed Calls",
      "Referral Campaigns",
      "Repeat Service",
      "Customer Reactivation",
    ],
  },
  {
    icon: FiMessageCircle,
    title: "Personalize Your Messages",
    body: "Edit the emails and texts customers will receive.",
    items: ["Email Preview", "Friendly and warm", "Short and conversational", "AI suggestions"],
  },
  {
    icon: FiPower,
    title: "Activate Strategym",
    body: "Your automations begin running automatically.",
    items: ["Automation Enabled", "Campaign Started", "Review Request Sent", "Estimate Reminder Sent"],
  },
];

export default function StrategymLanding() {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]');
    const previousRobots = robots?.getAttribute("content");
    const robotsMeta = robots || document.createElement("meta");

    if (!robots) {
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }

    document.title = "Strategym";
    robotsMeta.setAttribute("content", "noindex, nofollow, noarchive, nosnippet");
    document.body.classList.add("strategym-route");

    return () => {
      document.title = previousTitle;
      document.body.classList.remove("strategym-route");
      if (robots) {
        if (previousRobots) robots.setAttribute("content", previousRobots);
        else robots.removeAttribute("content");
      } else {
        robotsMeta.remove();
      }
    };
  }, []);

  return (
    <main className="strategym-page">
      <div className="strategym-content">
        <section className="strategym-hero" aria-labelledby="strategym-title">
          <p className="strategym-wordmark">Strategym</p>
          <div className="strategym-copy">
            <h1 id="strategym-title">
              More Reviews.
              <span>More Calls.</span>
              <span>More Jobs.</span>
            </h1>
            <p className="strategym-lede">
              AI-powered system that helps local business owners get more{" "}
              <strong>5-star reviews</strong> on autopilot.
            </p>
          </div>

          <figure className="strategym-review-art">
            <img
              src="/strategym/strategym-reviews-clean.png"
              alt="Strategym review request shown on a phone beside three five-star Google reviews for a local business"
              width="1308"
              height="1210"
            />
          </figure>

          <div className="strategym-stat">
            <span>Percentage of customers who leave reviews</span>
            <strong>+247%</strong>
            <small>Average increase</small>
          </div>

          <div className="strategym-benefits">
            {reviewBenefits.map(({ icon: Icon, title, body }) => (
              <article key={title}>
                <span className="strategym-icon" aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="strategym-trust">
            <p>Trusted by local businesses</p>
            <div>
              <span aria-label="Five out of five stars">★★★★★</span>
              <strong>Google 5.0</strong>
              <span>Compliant &amp; Secure</span>
            </div>
          </div>

          <p className="strategym-outcome">
            <FiTrendingUp aria-hidden="true" />
            <span>
              <strong>More Reviews. Higher Rankings. More Revenue.</strong>
              It all starts with Strategym.
            </span>
          </p>
        </section>

        <section className="strategym-automation" aria-labelledby="automation-title">
          <div className="strategym-automation-left">
            <p className="strategym-eyebrow">Follow-up automation</p>
            <h2 id="automation-title">
              Every lead.
              <span>Every customer.</span>
              <em>Never forgotten.</em>
            </h2>
            <p className="strategym-automation-copy">
              Turn every conversation into another opportunity. Strategym automatically follows up
              with new leads, pending estimates, completed jobs, referral opportunities, missed
              calls, and past customers—so your business keeps generating reviews, repeat work, and
              new revenue without extra effort.
            </p>

            <div className="strategym-followups">
              {followUps.map(({ icon: Icon, label }) => (
                <div key={label}>
                  <span className="strategym-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <strong>{label}</strong>
                  <span aria-hidden="true">→</span>
                </div>
              ))}
            </div>
          </div>

          <div className="strategym-automation-right">
            <div className="strategym-pipeline-heading">
              <strong>Every step. Automated.</strong>
              <span>More reviews. More referrals. More revenue.</span>
            </div>

            <ol className="strategym-pipeline">
              {pipeline.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className="strategym-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </div>
                </li>
              ))}
            </ol>

            <figure className="strategym-dashboard-art">
              <img
                src="/strategym/strategym-dashboard-clean.webp"
                alt="Strategym dashboard showing leads, booked jobs, reviews, revenue, automated follow-up campaigns, and customer pipeline"
                width="1014"
                height="513"
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section className="strategym-how" aria-labelledby="strategym-how-title">
          <header className="strategym-how-header">
            <p>How it works</p>
            <h2 id="strategym-how-title">Five minutes of setup. Years of follow-up.</h2>
            <span>
              Once your business is connected, Strategym works quietly in the background—
              following up with leads, customers, estimates, referrals, and review requests
              automatically.
            </span>
          </header>

          <div className="strategym-setup-flow">
            {setupSteps.map(({ icon: Icon, title, body, items }, index) => (
              <article className={`strategym-setup-card strategym-setup-card-${index + 1}`} key={title}>
                <span className="strategym-setup-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
                <div className="strategym-setup-details">
                  {items.map((item) => (
                    <span key={item}>
                      <FiCheckCircle aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <figure className="strategym-how-dashboard">
            <img
              src="/strategym/strategym-how-dashboard.webp"
              alt="Strategym performance dashboard showing reviews, revenue, appointments, referrals, campaign performance, automation success, and recent customer activity"
              width="488"
              height="560"
              loading="lazy"
            />
          </figure>

          <p className="strategym-how-outcome">
            <FiTrendingUp aria-hidden="true" />
            Less work. More reviews. More referrals. More revenue.
          </p>
        </section>
      </div>
    </main>
  );
}
