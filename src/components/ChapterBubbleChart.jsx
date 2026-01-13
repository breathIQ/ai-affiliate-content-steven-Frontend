import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bubble } from "react-chartjs-2";
import API from "../services/api";
import { useEffect, useRef, useState } from "react";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function ChapterBubbleChart({ useddetails }) {
  const [filter, setFilter] = useState(""); // Default filter
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("useddetails",filter, useddetails?.most_used_chapters);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // ✅ First render → use props data
    if (!filter) {
      console.log("cliekc");
      
      setDetails({most_used_chapters :useddetails?.most_used_chapters || []} );
      setLoading(false);
      return; // ❌ stop API call
    }

    // ✅ API call only after filter change
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const response = await API.get(
          `admin/most-used-chapter?filter_by=${filter}`
        );
        setDetails(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching bubble chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    if(filter){
      fetchChartData();
    }
  }, [filter, useddetails]);
  // console.log(details?.most_used_chapters);
  const most_used_chapters = details?.most_used_chapters || [
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
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#FACC15",
    "#EC4899",
    "#EF4444",
    "#06B6D4",
    "#D946EF",
    "#22C55E",
    "#EAB308",
  ];

  const data = {
    datasets: most_used_chapters.map((item, index) => ({
      label: `${item.label || `Ch - ${item.id}`}`,
      data: [
        {
          // X is decided by index (multiplied by a factor to spread them)
          x: index + 1,
          // Y is decided strictly by the usage 'total'
          y: item.data?.posts_count,
          // Radius is decided by usage (scaled for visibility)
          r: item.data?.posts_count / 15 + 10,
        },
      ],
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
          callback: (value) => (value > 0 ? value : ""),
        },
        min: 0,
        max: filter == "week" ? 7 : 31,
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#F3F4F6",
          borderDash: [5, 5], // Dotted lines from your image
          drawBorder: false,
        },
        ticks: { color: "#9CA3AF" },
        min: 0,
        max: 700,
      },
    },
    plugins: {
      legend: { display: false }, // Custom legend handled in JSX
      tooltip: {
        callbacks: {
          label: (context) => `Usage: ${context.raw.y}`,
        },
      },
    },
  };
  const legends = most_used_chapters?.slice(0, 12).map((item, index) => ({
    label: item?.label || `Ch - ${item.id}`,
    color: chartColors[index],
  }));

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full h">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold">Most Used Chapters</h2>
        <div className="flex gap-2 text-xs">
          <button
            className={`px-2 py-1  ${
              (filter === "month" || filter == "") ? " bg-gray-100" : ""
            } rounded`}
            onClick={() => setFilter("month")}
          >
            Month
          </button>
          <button
            className={`px-2 py-1  ${filter === "week" ? " bg-gray-100" : ""}`}
            onClick={() => setFilter("week")}
          >
            Week
          </button>
        </div>
      </div>
      <div className="h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            Loading...
          </div>
        ) : (
          <Bubble data={data} options={options} />
        )}
        {/* <Bubble data={data} options={options} /> */}
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-4 pt-4 mt-0 text-sm text-gray-600">
        {legends.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full`}
              style={{ background: item.color }}
            />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
