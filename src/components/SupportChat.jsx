import React, { useEffect, useRef, useState } from "react";

// Reusable CO2Body support chat. Used both as the big embedded panel on the
// /support page (variant="embedded") and inside the floating site-wide widget
// (variant="floating"). Talks to the shared Carbogenetics assistant API
// cross-origin with site:"co2body", so it answers as CO2Body support over the
// same knowledge base, order lookup, and ticket system. Session + transcript
// persist in localStorage and are shared across both surfaces.

const API_BASE = "https://carbogenetics.com";
const STORAGE_KEY = "co2body-chat-v1";

const GREETING =
  "Hi! I’m the CO2Body support assistant. Ask me anything about the platform — " +
  "generating posts, credits and billing, connecting Instagram or TikTok, avatars, " +
  "your affiliate links, or the Chrome extension. I can also help with Carbogenetics " +
  "product and order questions. Tap “Contact the team” anytime to reach a human.";

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        sessionId: parsed.sessionId ?? null,
        messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-60) : [],
      };
    }
  } catch {
    /* corrupted storage — start fresh */
  }
  return { sessionId: null, messages: [] };
}

function linkify(text) {
  return text.split(/(https:\/\/[^\s)"']+)/g).map((part, i) =>
    part.startsWith("https://") ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline break-all">
        {part}
      </a>
    ) : (
      part
    )
  );
}

function Bubble({ role, text }) {
  const isCustomer = role === "customer";
  return (
    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isCustomer ? "rounded-br-sm bg-violet-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-900"
        }`}
      >
        {isCustomer ? text : linkify(text)}
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-current"
      style={{ animationDelay: delay }}
    />
  );
}

export default function SupportChat({ variant = "embedded", onClose = null }) {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offerTicket, setOfferTicket] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketDone, setTicketDone] = useState(null);
  const [ticketError, setTicketError] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    const stored = loadStored();
    setSessionId(stored.sessionId);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, messages }));
    } catch {
      /* storage full/blocked — chat still works for this page view */
    }
  }, [sessionId, messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, showTicketForm, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "customer", text }]);
    if (/\b(order|package|parcel|shipment|shipped|deliver|tracking|track my)\b/i.test(text)) {
      setShowOrderForm(true);
    }
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, pageUrl: window.location.href, site: "co2body" }),
      });
      const json = await res.json();
      if (json.sessionId) setSessionId(json.sessionId);
      const answer =
        json.answer || json.error || "Sorry — something went wrong. Please try again or contact the team below.";
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
      if (json.offerTicket || json.error) setOfferTicket(true);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry — I couldn’t reach the server. Please try again, or use “Contact the team” below." },
      ]);
      setOfferTicket(true);
    } finally {
      setBusy(false);
    }
  }

  async function submitOrderCheck(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get("order_email") || "").trim();
    const orderNumber = String(fd.get("order_number") || "").trim();
    const postalCode = String(fd.get("order_zip") || "").trim();
    if (!email || (!orderNumber && !postalCode)) {
      setOrderError("Enter the order email plus the order number or ZIP code.");
      return;
    }
    setOrderBusy(true);
    setOrderError(null);
    setMessages((m) => [
      ...m,
      {
        role: "customer",
        text: `Order status check — ${email} · ${orderNumber ? `order #${orderNumber}` : `ZIP ${postalCode}`}`,
      },
    ]);
    try {
      const res = await fetch(`${API_BASE}/api/chat/order-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email, orderNumber, postalCode }),
      });
      const json = await res.json();
      if (json.sessionId) setSessionId(json.sessionId);
      const answer = json.answer || json.error || "Sorry — I couldn’t check that order right now.";
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
      if (json.found) setShowOrderForm(false);
      if (!json.found) setOfferTicket(true);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry — I couldn’t check that order right now. Please try again." },
      ]);
    } finally {
      setOrderBusy(false);
    }
  }

  async function submitTicket(e) {
    e.preventDefault();
    setTicketError(null);
    const fd = new FormData(e.target);
    try {
      const res = await fetch(`${API_BASE}/api/chat/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          subject: String(fd.get("subject") || ""),
          message: String(fd.get("message") || ""),
        }),
      });
      const json = await res.json();
      if (json.ticketNumber) {
        if (json.sessionId) setSessionId(json.sessionId);
        setTicketDone(json.ticketNumber);
        setShowTicketForm(false);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: `Done — support ticket #${json.ticketNumber} is created. Our team will reply to you by email.`,
          },
        ]);
      } else {
        setTicketError(json.error || "Could not create the ticket — please try again.");
      }
    } catch {
      setTicketError("Could not create the ticket — please try again.");
    }
  }

  const listHeight = variant === "floating" ? "h-[340px]" : "h-[420px]";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#151b2c] px-4 py-3">
        <div>
          <div className="text-sm font-bold uppercase tracking-wide text-white">CO2Body Support</div>
          <div className="text-[0.7rem] text-white/60">AI assistant · educational info only, not medical advice</div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close chat" className="text-white/70 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div ref={listRef} className={`${listHeight} flex-1 space-y-3 overflow-y-auto px-4 py-4`}>
        <Bubble role="assistant" text={GREETING} />
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.text} />
        ))}
        {busy && (
          <div className="flex items-center gap-1.5 px-1 text-slate-400" aria-label="Assistant is typing">
            <Dot delay="0ms" /> <Dot delay="150ms" /> <Dot delay="300ms" />
          </div>
        )}
      </div>

      {showOrderForm && !showTicketForm && (
        <form className="space-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-slate-900" onSubmit={submitOrderCheck}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-700">Check your Carbogenetics order</div>
            <button type="button" onClick={() => setShowOrderForm(false)} className="text-xs text-slate-500 hover:text-slate-900">
              Close
            </button>
          </div>
          <input name="order_email" type="email" required placeholder="Email used on the order" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
          <div className="flex gap-2">
            <input name="order_number" inputMode="numeric" placeholder="Order # (e.g. 1008)" className="w-full min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
            <input name="order_zip" placeholder="or shipping ZIP" className="w-full min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
          </div>
          {orderError && <p className="text-xs text-red-600">{orderError}</p>}
          <button type="submit" disabled={orderBusy} className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60">
            {orderBusy ? "Checking…" : "Check status"}
          </button>
        </form>
      )}

      {(offerTicket || ticketDone !== null) && !showTicketForm && ticketDone === null && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5">
          <button type="button" onClick={() => setShowTicketForm(true)} className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700">
            Contact the team
          </button>
        </div>
      )}

      {showTicketForm && (
        <form className="space-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-slate-900" onSubmit={submitTicket}>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-700">Send this chat to our team</div>
          <input name="name" required placeholder="Your name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
          <input name="email" type="email" required placeholder="Email address" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
          <input name="subject" placeholder="Subject (optional)" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
          <textarea name="message" rows={2} placeholder="Anything to add? (optional)" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
          {ticketError && <p className="text-xs text-red-600">{ticketError}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
              Create ticket
            </button>
            <button type="button" onClick={() => setShowTicketForm(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 hover:text-slate-900">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showTicketForm && !showOrderForm && (
        <div className="border-t border-slate-200 bg-white px-3 pt-2">
          <button type="button" onClick={() => setShowOrderForm(true)} className="text-xs font-semibold text-violet-600 hover:text-violet-800">
            📦 Check order status
          </button>
        </div>
      )}

      {!showTicketForm && (
        <form
          className={`flex items-center gap-2 bg-white px-3 py-3 ${showOrderForm ? "border-t border-slate-200" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about credits, posting, affiliate links…"
            maxLength={2000}
            aria-label="Your message"
            className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-violet-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send message"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
