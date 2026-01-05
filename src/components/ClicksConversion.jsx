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

export default function ClicksConversion() {
  const data = {
    labels: ["", "", "", "", "", ""],
    datasets: [
      {
        data: [20, 35, 30, 40, 33, 38],
        borderColor: "#EC4899",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,

        // 🔥 Pink gradient shadow
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

          gradient.addColorStop(0, "rgba(236, 72, 153, 0.35)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0)");

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
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">Affiliate Clicks</p>
          <p className="text-[32px] font-semibold pt-2 flex gap-2">
            <img src="/icons/ic-click.svg" alt="" />
            155
          </p>
        </div>
      </div>

      <Line data={data} options={options} height={120} />
    </div>
  );
}
