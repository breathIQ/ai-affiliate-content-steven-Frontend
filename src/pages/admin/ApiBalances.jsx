import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import API from "../../services/api";

const money = (v) =>
  `$${(v || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function StatusBadge({ provider }) {
  const map = {
    ok: provider.low
      ? { text: "LOW", cls: "bg-red-100 text-red-700" }
      : { text: "OK", cls: "bg-green-100 text-green-700" },
    missing_key: { text: "Key needed", cls: "bg-amber-100 text-amber-700" },
    error: { text: "Error", cls: "bg-red-100 text-red-700" },
    unsupported: { text: "No API", cls: "bg-gray-100 text-gray-500" },
  };
  const badge = map[provider.status] || map.error;
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-1 rounded-full ${badge.cls}`}
    >
      {badge.text}
    </span>
  );
}

function BigValue({ provider }) {
  if (provider.status === "ok" && provider.kind === "balance") {
    const value =
      provider.unit === "USD"
        ? money(provider.balance)
        : `${(provider.balance || 0).toLocaleString("en-US")} credits`;
    return (
      <>
        <p
          className={`text-[30px] font-bold mt-2 ${
            provider.low ? "text-red-600" : "text-gray-900"
          }`}
        >
          {value}
        </p>
        <p className="text-xs text-gray-400">remaining balance</p>
      </>
    );
  }

  if (provider.status === "ok" && provider.kind === "spend") {
    return (
      <>
        <p className="text-[30px] font-bold mt-2 text-gray-900">
          {money(provider.spend_month_usd)}
        </p>
        <p className="text-xs text-gray-400">spent this month</p>
      </>
    );
  }

  return (
    <p className="text-[30px] font-bold mt-2 text-gray-300">
      {provider.status === "unsupported" ? "n/a" : "?"}
    </p>
  );
}

function ProviderCard({ provider }) {
  return (
    <div
      className={`bg-white rounded-xl shadow p-5 flex flex-col ${
        provider.low ? "ring-2 ring-red-400" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700">{provider.name}</p>
        <StatusBadge provider={provider} />
      </div>

      <BigValue provider={provider} />

      {provider.detail && (
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          {provider.detail}
        </p>
      )}

      <a
        href={provider.dashboard_url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-blue-600 hover:underline mt-auto pt-3"
      >
        Open {provider.name.split(" ")[0]} dashboard
      </a>
    </div>
  );
}

function ApiBalances() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getData = async (fresh = false) => {
    try {
      if (fresh) setRefreshing(true);
      const response = await API.get(
        `admin/api-balances${fresh ? "?fresh=1" : ""}`
      );
      setDetails(response?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const providers = details?.providers || [];

  return (
    <Layout>
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto min-h-screen pt-10 pb-10 px-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">API Credits</h1>
            <button
              onClick={() => getData(true)}
              disabled={refreshing}
              className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh now"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Balances across every external AI provider the platform uses.
            {details?.fetched_at &&
              ` Last checked ${new Date(details.fetched_at).toLocaleString()}.`}
            {" "}Cached for 10 minutes.
          </p>

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p.key} provider={p} />
              ))}
            </div>
          )}

          {!loading && (
            <p className="text-xs text-gray-400 mt-8 leading-relaxed max-w-3xl">
              Anthropic and OpenAI do not expose a remaining-balance endpoint,
              so those cards show month-to-date spend from their admin cost
              APIs instead. Add ANTHROPIC_ADMIN_API_KEY and
              OPENAI_ADMIN_API_KEY to the server .env to activate them.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ApiBalances;
