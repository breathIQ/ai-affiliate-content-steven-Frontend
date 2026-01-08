import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

// ✅ Register required components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip
);

export default function UsersCard({ details }) {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [30, 40, 38, 45, 50, 55],
        borderColor: "#22C55E",
        borderWidth: 3,
        tension: 0.4,
        fill: true,

        // 🔑 Important for hover
        pointRadius: 0,
        pointHoverRadius: 6,
        hitRadius: 10,

        // 🌈 Gradient fill
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

          gradient.addColorStop(0, "rgba(34, 197, 94, 0.35)");
          gradient.addColorStop(1, "rgba(34, 197, 94, 0)");

          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    // ✅ Enables hover anywhere on line
    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `Users: ${context.parsed.y}`,
        },
      },
    },

    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <p className="text-sm text-gray-500">Total Users</p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-[32px] font-bold text-gray-900">
              {details?.total_users?.count || 0}
            </p>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              ↑ {details?.total_users?.growth_percent || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 👇 Chart Height Controlled Here */}
      <div className="h-[120px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
