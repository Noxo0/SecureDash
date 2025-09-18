import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export function SystemPerformanceChart({ timeframe = "24h" }: { timeframe?: "24h" | "7d" | "30d" }) {
  // Mock data generator based on timeframe
  const labels = useMemo(() => {
    if (timeframe === "24h") return Array.from({ length: 24 }, (_, i) => `${i}:00`);
    if (timeframe === "7d") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  }, [timeframe]);

  const data = useMemo(() => {
    const base = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30;
    const mk = (offset: number) => Array.from({ length: base }, (_, i) => Math.round(60 + 20 * Math.sin((i + offset) / 3) + 10 * Math.random()));
    return {
      labels,
      datasets: [
        {
          label: "CPU Usage %",
          data: mk(0),
          borderColor: "rgb(56, 189, 248)",
          backgroundColor: "rgba(56, 189, 248, 0.15)",
          tension: 0.35,
          fill: true,
          pointRadius: 0,
        },
        {
          label: "Memory Usage %",
          data: mk(4),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 0,
        },
      ],
    };
  }, [labels, timeframe]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground") || "#94a3b8" },
      },
      tooltip: { mode: "index" as const, intersect: false },
    },
    interaction: { mode: "nearest" as const, intersect: false },
    scales: {
      x: {
        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground") || "#94a3b8" },
        grid: { color: getComputedStyle(document.documentElement).getPropertyValue("--border") || "#334155" },
      },
      y: {
        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue("--muted-foreground") || "#94a3b8" },
        grid: { color: getComputedStyle(document.documentElement).getPropertyValue("--border") || "#334155" },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  }), []);

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}
