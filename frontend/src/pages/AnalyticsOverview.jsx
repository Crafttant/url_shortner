import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Reusable custom chart tooltip responsive to themes
const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl text-left text-xs space-y-1 border ${
        isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white/95 border-slate-200 text-slate-900"
      }`}>
        {label && <p className={`font-semibold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>}
        {payload.map((p, idx) => (
          <p key={idx} className={`font-bold flex items-center space-x-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color || p.fill }} />
            <span>{p.name}: <span className="text-indigo-500 dark:text-indigo-400">{p.value}</span></span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Reusable clean progress list component
const RenderProgressBarList = ({ data, total, barColor = "bg-indigo-500" }) => {
  if (!data || data.length === 0) {
    return <p className="text-xs text-[var(--text-secondary)] py-12 text-center">No data recorded.</p>;
  }

  const sum = total || data.reduce((acc, item) => acc + (item.value || item.clicks || 0), 0);

  return (
    <div className="space-y-4 pt-1">
      {data.slice(0, 5).map((item) => {
        const val = item.value || item.clicks || 0;
        const name = item.name || `/${item.shortId}`;
        const pct = sum > 0 ? Math.round((val / sum) * 100) : 0;

        return (
          <div key={name} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[var(--text-primary)] truncate max-w-[180px]" title={name}>
                {name}
              </span>
              <span className="text-[var(--text-secondary)] text-[11px] font-bold">
                {val} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full bg-slate-500/10 dark:bg-slate-800/60 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function AnalyticsOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isLoaded, userId } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["globalAnalytics"],
    queryFn: async () => {
      const response = await API.get("/url/analytics/summary");
      return response.data;
    },
    refetchInterval: 60000, // Background polling for auto synchronization
    enabled: isLoaded && !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-slate-500/10 rounded skeleton-shimmer"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="saas-card p-6 border rounded-2xl h-28 bg-slate-500/10 skeleton-shimmer"></div>
            ))}
          </div>
          <div className="saas-card p-6 border rounded-2xl h-80 bg-slate-500/10 skeleton-shimmer"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 text-center">
        <div className="saas-card p-8 border rounded-2xl max-w-md w-full space-y-4">
          <div className="text-rose-500 text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Error Loading Overview</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {error?.response?.data?.error || "Could not fetch aggregate click metrics. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const {
    totalLinks,
    totalClicks,
    dailyData,
    browserData,
    deviceData,
    countryData,
    topPerforming,
  } = data;

  const leader = topPerforming?.[0] || null;
  const gridStroke = isDark ? "rgba(255,255,255,0.05)" : "rgba(15, 23, 42, 0.05)";
  const axisColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 transition duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Sleek compact header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-black">Performance Dashboard</span>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mt-0.5">
              Global Traffic Analytics
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Real-time traffic trends, locations, browser distributions, and link diagnostics.
            </p>
          </div>
        </div>

        {/* Unified Statistics KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="saas-card border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Links</span>
              <div className="p-2.5 rounded-xl border text-blue-500 bg-blue-500/10 border-blue-500/20">🔗</div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[var(--text-primary)]">{totalLinks}</span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">shortened URLs in account</span>
            </div>
          </div>

          <div className="saas-card border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Clicks</span>
              <div className="p-2.5 rounded-xl border text-purple-500 bg-purple-500/10 border-purple-500/20">📈</div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[var(--text-primary)]">{totalClicks}</span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">visits logged globally</span>
            </div>
          </div>

          <div className="saas-card border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-400 to-amber-500"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Top Performing Link</span>
              <div className="p-2.5 rounded-xl border text-yellow-500 bg-yellow-500/10 border-yellow-500/20">🏆</div>
            </div>
            <div>
              <span className="text-lg font-black text-[var(--text-primary)] truncate block max-w-[200px]">
                {leader ? `/${leader.shortId}` : "None"}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                {leader ? `${leader.clicks} clicks recorded` : "No visits logged yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Clicks - Line Chart */}
        <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b saas-border pb-3">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Redirect Traffic Trend</h3>
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold">Past 30 Days</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  stroke={axisColor}
                  fontSize={9}
                  tickLine={false}
                  tickFormatter={(tick) => tick.substring(5)} // Show MM-DD only
                />
                <YAxis stroke={axisColor} fontSize={9} tickLine={false} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Line
                  type="monotone"
                  name="Clicks"
                  dataKey="clicks"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Details Grid - Simple Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Top Short Links */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Top Links
            </h3>
            <RenderProgressBarList data={topPerforming} total={totalClicks} barColor="bg-pink-500" />
          </div>

          {/* Top Geological Locations */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Top Countries
            </h3>
            <RenderProgressBarList data={countryData} total={totalClicks} barColor="bg-teal-500" />
          </div>

          {/* Top Browsers */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Top Browsers
            </h3>
            <RenderProgressBarList data={browserData} total={totalClicks} barColor="bg-indigo-500" />
          </div>

          {/* Top Devices */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Top Devices
            </h3>
            <RenderProgressBarList data={deviceData} total={totalClicks} barColor="bg-purple-500" />
          </div>

        </div>

      </div>
    </div>
  );
}
