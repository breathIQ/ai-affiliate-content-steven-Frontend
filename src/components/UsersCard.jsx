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
  // 1️⃣ Extract graph data from details prop
  const graphData = details?.total_users?.graph_data || [];
  
  // 2️⃣ Map the labels and values
  const labels = graphData.map((item) => item.label);
  const values = graphData.map((item) => item.value);

  const data = {
    labels: labels, // Dynamically set labels (e.g., ["2026-01-06", "2026-01-07"])
    datasets: [
      {
        data: values, // Dynamically set values (e.g., [1, 2])
        borderColor: "#22C55E",
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
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
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
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
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
      x: { display: false },
      y: { 
        display: false,
        // Suggested: start at 0 if you have low numbers like 1 and 2
        beginAtZero: true 
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

      <div className="h-[120px]">
        {/* Only render chart if there is data to avoid errors */}
        {graphData.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}