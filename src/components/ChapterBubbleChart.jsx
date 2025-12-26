import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bubble } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function ChapterBubbleChart() {
  const data = {
    datasets: [
      {
        label: "Ch - 1",
        data: [{ x: 25, y: 300, r: 25 }],
        backgroundColor: "#3B82F6",
      },
      {
        label: "Ch - 4",
        data: [{ x: 261, y: 350, r: 22 }],
        backgroundColor: "#6366F1",
      },
      {
        label: "Ch - 7",
        data: [{ x: 329, y: 420, r: 24 }],
        backgroundColor: "#FACC15",
      },
      {
        label: "Ch - 12",
        data: [{ x: 396, y: 240, r: 20 }],
        backgroundColor: "#EC4899",
      },
      {
        label: "Ch - 13",
        data: [{ x: 464, y: 480, r: 26 }],
        backgroundColor: "#8B5CF6",
      },
      {
        label: "Ch - 11",
        data: [{ x: 600, y: 300, r: 22 }],
        backgroundColor: "#22D3EE",
      },
    ],
  };

  const legends = [
    { label: "Ch - 1", color: "bg-blue-500" },
    { label: "Ch - 4", color: "bg-purple-500" },
    { label: "Ch - 7", color: "bg-green-500" },
    { label: "Ch - 8", color: "bg-orange-500" },
    { label: "Ch - 11", color: "bg-cyan-400" },
    { label: "Ch - 12", color: "bg-pink-500" },
    { label: "Ch - 13", color: "bg-yellow-400" },
  ];
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: "#E5E7EB" },
      },
      y: {
        grid: { color: "#E5E7EB" },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full h-[300px]">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold">Most Used Chapters</h2>
        <div className="flex gap-2 text-xs">
          <button className="px-2 py-1 bg-gray-100 rounded">Month</button>
          <button className="px-2 py-1">Week</button>
        </div>

      </div>
      <Bubble data={data} options={options} />
      <div className="flex flex-wrap gap-x-10 gap-y-4 mt-4 text-sm text-gray-600">
        {legends.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>


    </div>
  );
}
