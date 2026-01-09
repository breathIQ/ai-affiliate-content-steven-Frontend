import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip
);

export default function AffiliateClicksChart() {
  const data = {
    labels: Array(12).fill(""), // no labels shown
    datasets: [
      {
        data: [40, 60, 35, 35, 25, 60, 55, 70, 45, 65, 50, 40],
        borderColor: "#3B82F6",
        borderWidth: 3,
        tension: 0.45, // smooth curve
        fill: true,
        pointRadius: 0,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "#111827",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        padding: 8,
        cornerRadius: 4,
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
    <div className="h-28 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
