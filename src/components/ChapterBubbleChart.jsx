import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bubble } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function ChapterBubbleChart({ details }) {
 
  // console.log(details?.most_used_chapters);
  const most_used_chapters = details?.most_used_chapters|| [
    { id: 1, chapter: "CHAPTER 1", total: 45 },
    { id: 2, chapter: "CHAPTER 2", total: 12 },
    { id: 3, chapter: "CHAPTER 3", total: 88 },
    { id: 4, chapter: "CHAPTER 4", total: 34 },
    { id: 5, chapter: "CHAPTER 5", total: 56 },
    { id: 6, chapter: "CHAPTER 6", total: 22 },
    { id: 7, chapter: "CHAPTER 7", total: 95 },
    { id: 8, chapter: "CHAPTER 8", total: 10 },
    { id: 9, chapter: "CHAPTER 9", total: 67 },
    { id: 10, chapter: "CHAPTER 10", total: 41 },

  ];

 const chartColors = [
  "#10B981", "#3B82F6", "#8B5CF6", "#FACC15", "#EC4899", 
  "#EF4444", "#06B6D4", "#D946EF", "#22C55E", "#EAB308"
];

const data = {
  datasets: most_used_chapters.map((item, index) => ({
    label: `Ch - ${item.id}`,
    data: [{
      // X is decided by index (multiplied by a factor to spread them)
      x: (index + 1), 
      // Y is decided strictly by the usage 'total'
      y: item.total, 
      // Radius is decided by usage (scaled for visibility)
      r: item.total / 15 + 10 
    }],
    backgroundColor: chartColors[index % chartColors.length],
    hoverBackgroundColor: chartColors[index % chartColors.length],
  })),
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { 
        display: true,
        color: "#9CA3AF",
        // This shows the X-axis numbers similar to your screenshot
        callback: (value) => value > 0 ? value : "" 
      },
      min: 0,
      max: 10
    },
    y: {
      beginAtZero: true,
      grid: { 
        display: true, 
        color: "#F3F4F6", 
        borderDash: [5, 5], // Dotted lines from your image
        drawBorder: false 
      },
      ticks: { color: "#9CA3AF" },
      min: 0,
      max: 700
    },
  },
  plugins: {
    legend: { display: false }, // Custom legend handled in JSX
    tooltip: {
      callbacks: {
        label: (context) => `Usage: ${context.raw.y}`
      }
    }
  },
};
  const legends = most_used_chapters?.slice(0, 12).map((item, index) => ({
    label: `Ch - ${item.id}`,
    color: chartColors[index],
  }));

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full h">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold">Most Used Chapters</h2>
        <div className="flex gap-2 text-xs">
          <button className="px-2 py-1 bg-gray-100 rounded">Month</button>
          <button className="px-2 py-1">Week</button>
        </div>
      </div>
      <div className="h-[300px]">
        <Bubble data={data} options={options} />
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-4 pt-4 mt-0 text-sm text-gray-600">
        {legends.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full`} style={{background:item.color}} />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
