import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function UsersCard() {
  const data = {
    labels: ["", "", "", "", "", ""],
    datasets: [
      {
        data: [30, 40, 38, 45, 50, 55],
        borderColor: "#22C55E",
        tension: 0.4,
      },
      {
        data: [20, 25, 22, 28, 26, 30],
        borderColor: "#3B82F6",
        tension: 0.4,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-sm font-semibold mb-3">Users</h2>
      <hr className="py-6 my-4" />

      <Line data={data} options={options} height={120} />
      <hr className="pt-4 my-3" />

      <div className="flex justify-between border-top">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">884</p>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              ↑ 18%
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </div>

        {/* Active Users */}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">243</p>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              ↑ 18%
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full" />
            <p className="text-sm text-gray-500">Active Users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
