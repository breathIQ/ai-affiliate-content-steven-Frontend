import React from "react";
import SupportChat from "../../components/SupportChat";
import Layout from "../../components/Layout/Layout";

// CO2Body support page. The chat itself lives in the reusable SupportChat
// component (shared with the site-wide floating widget). It talks to the
// shared Carbogenetics assistant API with site:"co2body" — same knowledge
// base, order lookup, and ticket system.
//
// Logged-in users get the normal app chrome (Header + nav tabs + footer) so
// support feels like any other page; logged-out visitors get a standalone
// public page since Header would bounce them to /login.

const BLURB =
  "Ask our assistant anything — how CO2Body works, credits and billing, generating and " +
  "publishing posts, avatars, your affiliate links, the Chrome extension, or Carbogenetics " +
  "product and order questions. If it can’t solve it, it will hand the whole conversation to " +
  "our team as a ticket.";

const EmailNote = ({ className }) => (
  <p className={className}>
    You can also email{" "}
    <a href="mailto:ss@carbogenetics.com" className="underline hover:opacity-80">
      ss@carbogenetics.com
    </a>
    . Tickets are handled by the Carbogenetics support team.
  </p>
);

const Support = () => {
  const loggedIn = Boolean(
    localStorage.getItem("access_token") && localStorage.getItem("user")
  );

  if (loggedIn) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl pb-16 pt-8">
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{BLURB}</p>
          <div className="mt-6">
            <SupportChat variant="embedded" />
          </div>
          <EmailNote className="mt-5 text-xs text-gray-500" />
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <header className="border-b border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <a href="/" className="text-lg font-bold tracking-tight text-white">
            CO2<span className="text-violet-400">Body</span>
          </a>
          <a href="/login" className="text-sm text-slate-300 hover:text-white">
            Sign in →
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Support</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-300">{BLURB}</p>

        <div className="mt-8">
          <SupportChat variant="embedded" />
        </div>

        <EmailNote className="mt-6 text-xs text-slate-500" />
      </main>
    </div>
  );
};

export default Support;
