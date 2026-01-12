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

export default function AffiliateClicksChart({ chartData = [] }) {
    // 🔹 Transform API data
    const labels = chartData.map((item) => item.date);
    const values = chartData.map((item) => item.count);

    const data = {
        labels,
        datasets: [
            {
                data: values,
                borderColor: "#3B82F6",
                borderWidth: 3,
                tension: 0.45,
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

                // 🔹 Custom tooltip
                callbacks: {
                    title: (tooltipItems) => {
                        return tooltipItems[0].label; // date
                    },
                    label: (tooltipItem) => {
                        return `Clicks: ${tooltipItem.raw}`;
                    },
                },
            },
        },
        scales: {
            x: {
                display: false, // keep hidden like your design
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
