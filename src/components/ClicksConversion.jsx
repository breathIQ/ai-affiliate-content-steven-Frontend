import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function ClicksConversion() {
  const data = {
    labels: ["", "", "", "", "", ""],
    datasets: [
      {
        data: [20, 35, 30, 40, 33, 38],
        borderColor: "#EC4899",
        tension: 0.4,
      },
      // {
      //   data: [15, 18, 16, 20, 19, 22],
      //   borderColor: "#FACC15",
      //   tension: 0.4,
      // },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">
      {/* <h2 className="text-sm font-semibold mb-3">Clicks & Conversion</h2> */}
      <div className="flex justify-between border-top">
        <div>
          <p className="text-xs text-gray-500">Affiliate Clicks</p>
          <p className="text-[32px] font-semibold pt-2 flex gap-2">
            <img src="/icons/ic-click.svg" />
            155
          </p>
        </div>
      </div>
      <Line data={data} options={options} height={120} />
    </div>
  );
}
