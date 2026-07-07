import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import Layout from "../components/Layout/Layout";
import API from "../services/api";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "all_time", label: "All Time" },
];

const money = (cents) =>
  `$${((cents || 0) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const num = (v) => (v || 0).toLocaleString("en-US");

const METRIC_ROWS = [
  { key: "new_users", label: "New Users", format: num },
  { key: "revenue_cents", label: "Revenue", format: money, highlight: true },
  { key: "posts_generated", label: "Posts Generated", format: num },
  { key: "posts_published", label: "Posts Published", format: num },
  { key: "active_posters", label: "Users Who Posted", format: num },
  { key: "videos_generated", label: "Videos Generated", format: num },
  { key: "paying_users", label: "Paying Users", format: num },
  { key: "credits_purchased", label: "Credits Purchased", format: num },
  { key: "credits_spent", label: "Credits Spent", format: num },
  { key: "credits_refunded", label: "Credits Refunded", format: num },
];

function HighlightCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="text-[32px] font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function TrendChart({ title, labels, datasets, valueFormatter }) {
  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        callbacks: valueFormatter
          ? {
              label: (ctx) =>
                `${ctx.dataset.label}: ${valueFormatter(ctx.parsed.y)}`,
            }
          : undefined,
      },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 8, font: { size: 10 }, color: "#9CA3AF" },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 5,
          font: { size: 10 },
          color: "#9CA3AF",
          precision: 0,
          callback: valueFormatter
            ? (value) => valueFormatter(value)
            : undefined,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      <div className="relative h-[220px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

const lineDataset = (label, values, hex, rgb) => ({
  label,
  data: values,
  borderColor: hex,
  borderWidth: 3,
  tension: 0.4,
  fill: true,
  pointRadius: 0,
  pointHoverRadius: 6,
  hitRadius: 10,
  backgroundColor: (context) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) return null;
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );
    gradient.addColorStop(0, `rgba(${rgb}, 0.25)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    return gradient;
  },
});

function Stats() {
  const [details, setDetails] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await API.get(`admin/stats`);
      setDetails(response?.data?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const periods = details?.periods || {};
  const daily = details?.daily || [];

  const chartLabels = daily.map((d) =>
    d.date.slice(5).replace("-", "/")
  ); // "07/07"

  return (
    <Layout>
      <div className="bg-gray-100">
        {!loading && (
          <div className="max-w-7xl mx-auto min-h-screen pt-10 pb-10 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Platform Stats
            </h1>

            {/* Highlight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <HighlightCard
                label="New Users Today"
                value={num(periods.today?.new_users)}
                sub={`${num(periods.this_week?.new_users)} this week`}
                color="bg-green-500"
              />
              <HighlightCard
                label="Revenue This Month"
                value={money(periods.this_month?.revenue_cents)}
                sub={`${money(periods.today?.revenue_cents)} today`}
                color="bg-blue-500"
              />
              <HighlightCard
                label="Posts This Month"
                value={num(periods.this_month?.posts_generated)}
                sub={`by ${num(periods.this_month?.active_posters)} users`}
                color="bg-purple-500"
              />
              <HighlightCard
                label="Credits Spent This Month"
                value={num(periods.this_month?.credits_spent)}
                sub={`${num(periods.this_month?.credits_purchased)} purchased`}
                color="bg-orange-500"
              />
            </div>

            {/* Metrics table */}
            <div className="bg-white rounded-xl shadow overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">
                      Metric
                    </th>
                    {PERIODS.map((p) => (
                      <th
                        key={p.key}
                        className="text-right px-5 py-3 text-gray-500 font-medium"
                      >
                        {p.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRIC_ROWS.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-3 font-medium text-gray-700">
                        {row.label}
                      </td>
                      {PERIODS.map((p) => (
                        <td
                          key={p.key}
                          className={`px-5 py-3 text-right ${
                            row.highlight
                              ? "font-semibold text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {row.format(periods[p.key]?.[row.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Trend charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                title="Signups & Posts — Last 30 Days"
                labels={chartLabels}
                datasets={[
                  lineDataset(
                    "New Users",
                    daily.map((d) => d.signups),
                    "#22C55E",
                    "34, 197, 94"
                  ),
                  lineDataset(
                    "Posts",
                    daily.map((d) => d.posts),
                    "#8B5CF6",
                    "139, 92, 246"
                  ),
                ]}
              />
              <TrendChart
                title="Revenue — Last 30 Days"
                labels={chartLabels}
                datasets={[
                  lineDataset(
                    "Revenue",
                    daily.map((d) => (d.revenue_cents || 0) / 100),
                    "#3B82F6",
                    "59, 130, 246"
                  ),
                ]}
                valueFormatter={(v) => money(v * 100)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Stats;
