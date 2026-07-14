import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import API from "../../services/api";

export const TYPE_BADGES = {
  purchase: "bg-green-100 text-green-700",
  auto_recharge: "bg-emerald-100 text-emerald-700",
  deduction: "bg-gray-100 text-gray-600",
  refund: "bg-blue-100 text-blue-700",
};

export const typeLabel = (t) =>
  (t || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const money = (cents) =>
  cents == null
    ? ""
    : `$${(cents / 100).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

export const formatDateTime = (s) =>
  s
    ? new Date(s.replace(" ", "T")).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export function TransactionsTable({ rows, showUser, onUserClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-3 text-start">Date</th>
            {showUser && <th className="p-3 text-start">User</th>}
            <th className="p-3 text-start">Type</th>
            <th className="p-3 text-end">Credits</th>
            <th className="p-3 text-end">Value</th>
            <th className="p-3 text-end">Balance After</th>
            <th className="p-3 text-start">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showUser ? 7 : 6} className="py-16 text-center text-gray-400">
                No transactions found.
              </td>
            </tr>
          ) : (
            rows.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap text-gray-600">
                  {formatDateTime(t.created_at)}
                </td>
                {showUser && (
                  <td className="p-3">
                    {t.user ? (
                      <button
                        onClick={() => onUserClick && onUserClick(t.user)}
                        className="text-left"
                      >
                        <div className="font-medium text-blue-600 hover:underline">
                          {t.user.name}
                        </div>
                        <div className="text-xs text-gray-500">{t.user.email}</div>
                      </button>
                    ) : (
                      <span className="text-gray-400">Deleted user</span>
                    )}
                  </td>
                )}
                <td className="p-3">
                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      TYPE_BADGES[t.type] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {typeLabel(t.type)}
                  </span>
                </td>
                <td
                  className={`p-3 text-end font-semibold ${
                    t.credits < 0 ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {t.credits > 0 ? `+${t.credits}` : t.credits}
                </td>
                <td className="p-3 text-end text-gray-700">{money(t.amount_cents)}</td>
                <td className="p-3 text-end text-gray-500">{t.balance_after}</td>
                <td className="p-3 max-w-[320px]">
                  <div className="truncate text-gray-600" title={t.description || ""}>
                    {t.description || ""}
                  </div>
                  {t.stripe_payment_intent_id && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${t.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-500 hover:underline"
                    >
                      View in Stripe
                    </a>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const TYPES = ["", "purchase", "auto_recharge", "deduction", "refund"];

function Transactions() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    getData();
  }, [page, type, debouncedSearch]);

  const getData = async () => {
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (type) params.set("type", type);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const response = await API.get(`admin/transactions?${params.toString()}`);
      const payload = response?.data?.data;
      setRows(payload?.data || []);
      setLastPage(payload?.last_page || 1);
      setTotal(payload?.total || 0);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto min-h-screen pt-8 pb-10 px-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-gray-500">
            Every credit purchase, charge and refund across all users. Click a
            user to see their full history.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-3">
            <h2 className="font-medium">
              All Transactions{" "}
              <span className="text-gray-400 font-normal">({total})</span>
            </h2>
            <div className="flex gap-2">
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="border rounded-lg text-sm px-3 py-2 focus:outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t ? typeLabel(t) : "All types"}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name or email"
                className="pl-4 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-[240px]"
              />
            </div>
          </div>

          <TransactionsTable
            rows={rows}
            showUser
            onUserClick={(u) => navigate(`/admin/users/${u.id}`)}
          />

          <div className="flex items-center justify-between p-4 text-sm text-gray-500">
            <span>
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded-md disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded-md disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Transactions;
