import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Bubble } from "react-chartjs-2";
import API from "../services/api";
import { useEffect, useRef, useState } from "react";

ChartJS.register(LinearScale, PointElement, TimeScale, Tooltip, Legend);

export default function ChapterBubbleChart({ useddetails }) {
  const [filter, setFilter] = useState(""); // Default filter
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("detailsdetails", details);
  // console.log("useddetails",filter, useddetails?.most_used_chapters);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // ✅ First render → use props data
    if (!filter) {
      // console.log("cliekc");

      setDetails({ most_used_chapters: useddetails?.most_used_chapters || [] });
      setLoading(false);
      return; // ❌ stop API call
    }

    // ✅ API call only after filter change
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const response = await API.get(
          `admin/most-used-chapter?filter_by=${filter}`,
        );
        setDetails(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching bubble chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (filter) {
      fetchChartData();
    }
  }, [filter, useddetails]);
  // console.log(details?.most_used_chapters);
  const most_used_chapters = details?.most_used_chapters || [];

  const getMonthDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const days = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: days }, (_, i) => {
      return new Date(year, month, i + 1);
    });
  };

  const getWeekDates = () => {
    const today = new Date();

    // start of current week (Sunday)
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const axisDates = filter === "week" ? getWeekDates() : getMonthDates();

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

  const normalizeBubbleData = (chapters = []) => {
    return chapters.map((item, index) => {
      return {
        label: item.label || `Ch-${index + 1}`,
        date: item.data?.[0]?.x || null,
        data: item.data.map((point) => {
          const bubbleDate = new Date(point.x);

          // find matching axis index
          const axisIndex = axisDates.findIndex(
            (d) => d.toDateString() === bubbleDate.toDateString(),
          );

          return {
            x: axisIndex !== -1 ? axisIndex : 0, // map to axis position
            y: point?.y ?? 0,
            r: (point?.y ?? 1) * 5,
            date: point.x,
          };
        }),
        backgroundColor: chartColors[index % chartColors.length],
        hoverBackgroundColor: chartColors[index % chartColors.length],
      };
    });
  };

  const data = {
    datasets: normalizeBubbleData(most_used_chapters),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
    padding: {
      bottom: 20 // Adjust this value if the rotated years are touching the legend
    }
  },
    scales: {
    //   x: {
    //     type: "linear",
    //     grid: { display: false },
    //     min: 0,
    //     max: axisDates.length - 1,
    //     //   color: "#9CA3AF",
    //     //   callback: (value) => {
    //     //     const date = axisDates[value - 1];
    //     //     if (!date) return "";

    //     //     return filter === "week"
    //     //       ? date.toLocaleDateString(undefined, {  day: "numeric",
    //     //           month: "short", })
    //     //       : date.toLocaleDateString(undefined, {
    //     //           day: "numeric",
    //     //           month: "short",
    //     //         });
    //     //   },
    //     // },
    //     ticks: {
    //       color: "#9CA3AF",
    //       autoSkip: true, 
    // // ✅ Adjusting this limit fixes the crowding you saw in your image
    // maxTicksLimit: filter === "week" ? 7 : 20, 
    // // ✅ Ensures the labels stay horizontal
    // maxRotation: 0,
    // minRotation: 0,
    //       callback: function (value) {
    //         const date = axisDates[value]; // value corresponds to the index
    //         if (!date) return "";
    //         return date.toLocaleDateString(undefined, {
    //           day: "numeric",
    //           month: "short",
    //         });
    //       },
    //     },
    //   },
// x: {
//   type: 'linear',
//   grid: { display: false },
//   min: 0,
//   max: axisDates.length - 1,
//   ticks: {
//     color: "#9CA3AF",
//     // 1. Rotation settings
//     minRotation: 45, // Rotates labels to 45 degrees
//     maxRotation: 45,
    
//     // 2. Overlap & Skipping logic
//     autoSkip: true, 
//     maxTicksLimit: filter === "week" ? 7 : 20, // Limits total labels to prevent crowding
    
//     callback: function(value, index, values) {
//       const date = axisDates[Math.round(value)];
//       if (!date) return "";

//       // 3. Optional: Logic to hide the second-to-last label if it's too close to the end
//       const isLast = index === values.length - 1;
//       const isSecondToLast = index === values.length - 2;
      
//       // If the second to last tick is very close to the end (e.g., within 2 days), skip it
//       // if (isSecondToLast && (axisDates.length - 1 - value) < 3) {
//       //   return "";
//       // }

//       return date.toLocaleDateString(undefined, { 
//         day: "numeric", 
//         month: "short",
//       });
//     },
//   },
// },
x: {
  type: 'linear',
  grid: { display: false },
  // ✅ Offset adds padding to the start and end of the axis
  // offset: true, 
  min: 0,
  max: axisDates.length - 1,
  ticks: {
    color: "#9CA3AF",
    // ✅ This forces the chart to attempt to show every single index
    stepSize: 1, 
    autoSkip: false, // Prevents Chart.js from hiding dates
    minRotation: 45,
    maxRotation: 45,
    callback: function(value) {
      const date = axisDates[Math.round(value)];
      if (!date) return "";
      return date.toLocaleDateString(undefined, { 
        day: "numeric", 
        month: "short",
      });
    },
  },
},
      y: {
        beginAtZero: true,
        grid: {
          color: "#F3F4F6",
          borderDash: [5, 5],
          drawBorder: false,
        },
        ticks: { color: "#9CA3AF" },
      },
    },
    plugins: {
      legend: { display: false },
      // tooltip: {
      //   callbacks: {
      //     title: (items) => {
      //                   // console.log(items , "<<<");
      //       if (!items.length) return "";
      //       const date = new Date(items[0].dataset.date);
      //       return `Date: ${date.toLocaleDateString()}`;
      //     },
      //     label: (ctx) =>{
      //       // console.log(ctx , "<<<");

      //       return `${ctx.dataset.label} → Usage: ${ctx.raw.y}`;
      //     },
      //   },
      // },
      tooltip: {
        callbacks: {
          title: (context) => {
            if (!context.length) return "";
            // Get the 'date' property we added to the point in normalizeBubbleData
            const dateStr = context[0].raw.date;
            const date = new Date(dateStr);
            return `Date: ${date.toLocaleDateString()}`;
          },
          label: (ctx) => {
            return `${ctx.dataset.label} → Usage: ${ctx.raw.y}`;
          },
        },
      },
    },
  };

//   const options = {
//   responsive: true,
//   maintainAspectRatio: false,
//   scales: {
//     x: {
//       // type: 'linear', // Ensure this is linear to use indices
//       grid: { display: false },
//       min: 0,
//       max: axisDates.length - 1,
//       ticks: {
//         color: "#9CA3AF",
//         // ✅ This prevents dates from overlapping
//        autoSkip: true, 
//     // ✅ Adjusting this limit fixes the crowding you saw in your image
//     maxTicksLimit: filter === "week" ? 7 : 8, 
//     // ✅ Ensures the labels stay horizontal
//     maxRotation: 0,
//     minRotation: 0,
//         callback: function(value) {
//           console.log("value",axisDates ,value);
          
//           const date = axisDates[value];
//           if (!date) return "";
//           return date.toLocaleDateString(undefined, { 
//             day: "numeric", 
//             month: "short" 
//           });
//         },
//       },
//     },
//     y: {
//       beginAtZero: true,
//       suggestedMax: 5, // Gives some breathing room at the top
//       grid: {
//         color: "#F3F4F6",
//         borderDash: [5, 5],
//       },
//     },
//   },
//   plugins: {
//     legend: { display: false },
//     tooltip: {
//       callbacks: {
//         title: (context) => {
//           const dateStr = context[0].raw.fullDate;
//           return `Date: ${new Date(dateStr).toLocaleDateString()}`;
//         },
//         label: (ctx) => `${ctx.dataset.label} → Usage: ${ctx.raw.y}`,
//       },
//     },
//   },
// };

  const legends = most_used_chapters.map((item, index) => ({
    label: item.label || `Ch-${index + 1}`,
    color: chartColors[index % chartColors.length],
  }));

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full h">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold">Most Used Chapters</h2>
        <div className="flex gap-2 text-xs">
          <button
            className={`px-2 py-1  ${
              filter === "month" || filter == "" ? " bg-gray-100" : ""
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
      <div style={filter != "week" ?{overflowX:"scroll"}:{}}>

      <div className={`h-[300px] ${filter != "week" ? "w-[700px]":""} `}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            Loading...
          </div>
        ) : (
          <Bubble data={data} options={options} />
        )}
      </div>
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
