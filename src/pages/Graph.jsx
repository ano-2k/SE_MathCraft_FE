import React, { useEffect, useRef, useState } from "react";
import { Flame, TrendingUp, BarChart, PieChart, Loader2 } from "lucide-react";
import axios from "axios";

const BASE_API = import.meta.env.VITE_BASE_API;

const Graph = () => {
  const iqLineChartRef = useRef(null);
  const streakLineChartRef = useRef(null);
  const monthlyIQChartRef = useRef(null);
  const modePieChartRef = useRef(null);

  const chartInstances = useRef({});
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const PRIMARY_PINK = "#db2777";
  const SECONDARY_PURPLE = "#9333ea";
  const animationConfig = { duration: 1200, easing: "easeOutQuart" };

  const destroyIfExists = (key) => {
    if (chartInstances.current[key]) {
      chartInstances.current[key].destroy();
      chartInstances.current[key] = null;
    }
  };

  const fetchChartData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Token ${token}` };

    try {
      const [iqRes, streakRes, monthlyRes, modeRes] = await Promise.all([
        axios.get(`${BASE_API}/api/iq-evolution/`, { headers }),
        axios.get(`${BASE_API}/api/last-ten-games-chart/`, { headers }),
        axios.get(`${BASE_API}/api/monthly-iq-chart/`, { headers }),
        axios.get(`${BASE_API}/api/mode-distribution-chart/`, { headers }),
      ]);

      setChartData({
        iqData: iqRes.data,
        streakData: streakRes.data,
        monthlyData: monthlyRes.data,
        modeData: modeRes.data,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const initializeCharts = () => {
    const Chart = window.Chart;
    if (!Chart || !chartData) return;

    // --- IQ Evolution ---
    if (iqLineChartRef.current && chartData.iqData?.iq_scores?.length > 0) {
      destroyIfExists("iq");
      chartInstances.current["iq"] = new Chart(
        iqLineChartRef.current.getContext("2d"),
        {
          type: "line",
          data: {
            labels: chartData.iqData.labels,
            datasets: [
              {
                label: "IQ Score",
                data: chartData.iqData.iq_scores,
                borderColor: SECONDARY_PURPLE,
                backgroundColor: "rgba(147, 51, 234, 0.1)",
                pointBackgroundColor: SECONDARY_PURPLE,
                pointRadius: 5,
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: animationConfig,
            plugins: { legend: { display: false } },
            scales: {
              y: { suggestedMin: 0, grid: { color: "rgba(0,0,0,0.05)" } },
              x: { grid: { display: false } },
            },
          },
        }
      );
    }

    // --- Game Performance (last 10 games streak) ---
    if (streakLineChartRef.current && chartData.streakData?.total_streaks?.length > 0) {
      destroyIfExists("streak");
      chartInstances.current["streak"] = new Chart(
        streakLineChartRef.current.getContext("2d"),
        {
          type: "line",
          data: {
            labels: chartData.streakData.labels,
            datasets: [
              {
                label: "Total Streak per Game",
                data: chartData.streakData.total_streaks,
                borderColor: PRIMARY_PINK,
                backgroundColor: "rgba(219, 39, 119, 0.2)",
                pointBackgroundColor: chartData.streakData.modes.map((mode) => {
                  if (mode === "Easy") return "green";
                  if (mode === "Intermediate") return "orange";
                  if (mode === "Hard") return "red";
                  return PRIMARY_PINK;
                }),
                pointRadius: 6,
                tension: 0.4,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: animationConfig,
            plugins: {
              legend: { display: true },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const index = context.dataIndex;
                    const mode = chartData.streakData.modes[index];
                    const streak = context.dataset.data[index];
                    return ` ${streak} points (${mode})`;
                  },
                },
              },
            },
            scales: {
              y: { beginAtZero: true, suggestedMax: 50, ticks: { precision: 0 } },
              x: { grid: { display: false } },
            },
          },
        }
      );
    }

    // --- Monthly IQ ---
    if (monthlyIQChartRef.current && chartData.monthlyData?.avg_iq?.length > 0) {
      destroyIfExists("monthly");
      chartInstances.current["monthly"] = new Chart(
        monthlyIQChartRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: chartData.monthlyData.labels,
            datasets: [
              {
                label: "Average IQ",
                data: chartData.monthlyData.avg_iq,
                backgroundColor: PRIMARY_PINK,
                hoverBackgroundColor: SECONDARY_PURPLE,
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: animationConfig,
            plugins: { legend: { display: false } },
            scales: {
              y: { suggestedMin: 0, grid: { color: "rgba(0,0,0,0.05)" } },
              x: { grid: { display: false } },
            },
          },
        }
      );
    }

    // --- Mode Distribution ---
    if (modePieChartRef.current && chartData.modeData?.counts?.some((c) => c > 0)) {
      destroyIfExists("mode");
      chartInstances.current["mode"] = new Chart(
        modePieChartRef.current.getContext("2d"),
        {
          type: "doughnut",
          data: {
            labels: ["Easy", "Intermediate", "Hard"],
            datasets: [
              {
                data: chartData.modeData.counts,
                backgroundColor: ["#f9a8d4", PRIMARY_PINK, SECONDARY_PURPLE],
                hoverOffset: 15,
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: animationConfig,
            plugins: {
              legend: {
                position: "bottom",
                labels: { padding: 20, font: { weight: "bold" } },
              },
            },
          },
        }
      );
    }
  };

  useEffect(() => {
    const loadChartJsAndData = async () => {
      if (!window.Chart) {
        const scriptTag = document.createElement("script");
        scriptTag.src = "https://cdn.jsdelivr.net/npm/chart.js";
        scriptTag.async = true;
        document.body.appendChild(scriptTag);
        await new Promise((resolve) => (scriptTag.onload = resolve));
      }
      await fetchChartData();
    };

    loadChartJsAndData();
  }, []);

  useEffect(() => {
    if (chartData) initializeCharts();
  }, [chartData]);

  const ChartCard = ({ title, icon: Icon, chartRef, hasData, emptyMessage }) => (
    <div className="card border border-gray-200 hover:border-purple-300">
      <div className="flex items-center space-x-3 mb-4">
        <Icon size={24} className="text-purple-600" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4"></p>
      <div className="chart-container relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl transition-opacity duration-300">
            <div className="text-pink-600 flex items-center space-x-2 animate-pulse p-4 rounded-lg">
              <Loader2 className="animate-spin" size={24} />
              <span className="font-semibold">Drawing Charts...</span>
            </div>
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-full text-gray-400 font-semibold">
            {emptyMessage}
          </div>
        ) : (
          <canvas ref={chartRef}></canvas>
        )}
      </div>
    </div>
  );

  const hasIQData = chartData?.iqData?.iq_scores?.length > 0;
  const hasStreakData = chartData?.streakData?.total_streaks?.length > 0;
  const hasMonthlyData = chartData?.monthlyData?.avg_iq?.length > 0;
  const hasModeData = chartData?.modeData?.counts?.some((c) => c > 0);

  return (
    <>
      <style>{`
        .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          height: 100%;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.1);
        }
        .chart-container {
  position: relative;
  height: 250px; /* default small/mobile */
}
@media (min-width: 768px) {
  .chart-container { height: 300px; } /* medium screens */
}
@media (min-width: 1024px) {
  .chart-container { height: 350px; } /* large screens */
}

      `}</style>

      <div className="min-h-screen py-10 px-4 sm:px-12 lg:ml-64 font-sans">

        <header className="py-6 sm:py-8 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-pink-700 mb-3 mt-6 tracking-tight">

            📈 Performance Deep Dive
          </h1>
          <p className="text-xl text-pink-600 font-medium">
            Visualize your growth, consistency, and mastery across all game modes.
          </p>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">

          <ChartCard
            title="IQ Evolution (Last 10 Games)"
            icon={TrendingUp}
            chartRef={iqLineChartRef}
            hasData={hasIQData}
            emptyMessage="No IQ records available"
          />
          <ChartCard
            title="Game Performance (Last 10 Games)"
            icon={Flame}
            chartRef={streakLineChartRef}
            hasData={hasStreakData}
            emptyMessage="No game records available"
          />
          <ChartCard
            title="Average Monthly Performance"
            icon={BarChart}
            chartRef={monthlyIQChartRef}
            hasData={hasMonthlyData}
            emptyMessage="No monthly records available"
          />
          <ChartCard
            title="Mode Engagement Distribution"
            icon={PieChart}
            chartRef={modePieChartRef}
            hasData={hasModeData}
            emptyMessage="No mode records available"
          />
        </main>
      </div>
    </>
  );
};

export default Graph;
