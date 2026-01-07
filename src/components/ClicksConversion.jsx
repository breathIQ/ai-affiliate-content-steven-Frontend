// import {
//   Chart as ChartJS,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Filler,
// } from "chart.js";
// import { Line } from "react-chartjs-2";

// ChartJS.register(
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Filler
// );

// export default function ClicksConversion({details}) {
//   const data = {
//     labels: ["", "", "", "", "", ""],
//     datasets: [
//       {
//         data: [20, 35, 30, 40, 33, 38],
//         borderColor: "#EC4899",
//         borderWidth: 3,
//         tension: 0.4,
//         fill: true,
//         pointRadius: 0,

//         // 🔥 Pink gradient shadow
//         backgroundColor: (context) => {
//           const chart = context.chart;
//           const { ctx, chartArea } = chart;

//           if (!chartArea) return null;

//           const gradient = ctx.createLinearGradient(
//             0,
//             chartArea.top,
//             0,
//             chartArea.bottom
//           );

//           gradient.addColorStop(0, "rgba(236, 72, 153, 0.35)");
//           gradient.addColorStop(1, "rgba(236, 72, 153, 0)");

//           return gradient;
//         },
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//     },
//     scales: {
//       x: { display: false },
//       y: { display: false },
//     },
//   };

//   return (
//     <div className="bg-white rounded-xl shadow p-5">
//       <div className="flex justify-between">
//         <div>
//           <p className="text-xs text-gray-500">Affiliate Clicks</p>
//           <p className="text-[32px] font-semibold pt-2 flex gap-2">
//             <img src="/icons/ic-click.svg" alt="" />
//             {details?.affiliate_clicks||0}
//           </p>
//         </div>
//       </div>

//       <Line data={data} options={options} height={120} />
//     </div>
//   );
// }


import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function AffiliateClicksChart({ details }) {
  // Extract data from props
  const affiliate_clicks = details?.affiliate_clicks
  const labels = affiliate_clicks?.graph_data?.map((item) => item.label) || [];
  const values = affiliate_clicks?.graph_data?.map((item) => item.value) || [];

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Clicks',
        data: values,
        borderColor: '#8B5CF6', // Purple color matching your theme
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4, // Makes the line curved
        pointRadius: 4,
        pointBackgroundColor: '#8B5CF6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6' },
        ticks: { stepSize: 1 } // Since your data has small integers
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Total Affiliate Clicks</h2>
          <p className="text-2xl font-bold text-gray-900">{affiliate_clicks?.total || 0}</p>
        </div>
        {/* <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-bold">
          Live
        </div> */}
      </div>

      <div className="h-[200px]">
        {labels.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No click data available
          </div>
        )}
      </div>
    </div>
  );
}