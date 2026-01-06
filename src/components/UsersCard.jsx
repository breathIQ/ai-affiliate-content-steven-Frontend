import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

export default function UsersCard({details}) {
  const data = {
    labels: ["", "", "", "", "", ""],
    datasets: [
      {
        data: [30, 40, 38, 45, 50, 55],
        borderColor: "#22C55E",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,

        // 🔥 Gradient shadow
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
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: true },
      y: { display: true },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[32px] font-bold text-gray-900">{details?.total_users?.count||0}</p>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              ↑ {details?.total_users?.growth_percent}%
            </span>
          </div>
        </div>
      </div>

      <Line data={data} options={options} height={120} />
    </div>
  );
}
