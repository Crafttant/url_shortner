import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b", "#3b82f6", "#10b981", "#64748b"];

// Premium custom chart tooltip responsive to themes
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

export default function Analytics() {
  const { shortId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", shortId],
    queryFn: async () => {
      const response = await API.get(`/url/analytics/${shortId}`);
      return response.data;
    },
    refetchInterval: 3000, // Background polling for auto synchronization
  });

  const getShortUrl = () => {
    const apiBase = import.meta.env.VITE_API_URL;
    return `${apiBase}/url/${shortId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-slate-500/10 rounded skeleton-shimmer"></div>
          <div className="saas-card p-6 border rounded-2xl space-y-3">
            <div className="h-8 w-2/3 bg-slate-500/10 rounded skeleton-shimmer"></div>
            <div className="h-4 w-1/3 bg-slate-500/10 rounded skeleton-shimmer"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="saas-card p-6 border rounded-2xl h-28 skeleton-shimmer bg-slate-500/10"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 text-center">
        <div className="saas-card p-8 border rounded-2xl max-w-md w-full space-y-4">
          <div className="text-rose-500 text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Error Loading Analytics</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {error?.response?.data?.error || "We encountered an issue fetching metrics for this link. Verify ownership and try again."}
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { stats, recentVisits, clicksCount, originalUrl, createdAt } = data;
  const totalVisits = clicksCount || 0;

  // Convert stats dictionaries to Recharts arrays
  const browserChartData = Object.entries(stats.browser).map(([name, value]) => ({ name, value }));
  const deviceChartData = Object.entries(stats.device).map(([name, value]) => ({ name, value }));
  const osChartData = Object.entries(stats.os).map(([name, value]) => ({ name, value }));
  const countryChartData = Object.entries(stats.country).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  const referrerChartData = Object.entries(stats.referrer).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  // Parse and pre-populate timeline counts
  const timelineChartData = Object.entries(stats.timeline)
    .map(([date, clicks]) => ({ date, clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const getTopKey = (statsObj) => {
    if (!statsObj || Object.keys(statsObj).length === 0) return "None";
    return Object.entries(statsObj).sort((a, b) => b[1] - a[1])[0][0];
  };

  const gridStroke = isDark ? "rgba(255,255,255,0.05)" : "rgba(15, 23, 42, 0.05)";
  const axisColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 transition duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] hover:text-indigo-400 transition"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header summary banner */}
        <div className="saas-card border p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black font-mono">Link Diagnostics</span>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                /{shortId}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] truncate max-w-xl">
                Destination:{" "}
                <a
                  href={originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline hover:text-indigo-300 transition"
                >
                  {originalUrl}
                </a>
              </p>
            </div>
            
            <div className="text-left md:text-right text-[11px] text-[var(--text-secondary)] font-medium space-y-1 bg-slate-500/5 px-4 py-2.5 rounded-xl border saas-border">
              <div>Created: {new Date(createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}</div>
              <div>Short URL: <a href={getShortUrl()} target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">{getShortUrl()}</a></div>
            </div>
          </div>
        </div>

        {/* Counter Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="saas-card border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Clicks</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">{totalVisits}</span>
              <span className="text-xs text-indigo-400 font-semibold">visits logged</span>
            </div>
          </div>

          <div className="saas-card border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Top Referrer</span>
            <div className="mt-2 text-xl font-extrabold text-[var(--text-primary)] truncate">
              {getTopKey(stats.referrer)}
            </div>
          </div>

          <div className="saas-card border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Top Location</span>
            <div className="mt-2 text-xl font-extrabold text-[var(--text-primary)] truncate">
              {getTopKey(stats.country)}
            </div>
          </div>

          <div className="saas-card border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Top Device</span>
            <div className="mt-2 text-xl font-extrabold text-[var(--text-primary)] truncate">
              {getTopKey(stats.device)}
            </div>
          </div>
        </div>

        {/* Recharts Timeline */}
        <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b saas-border pb-3">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Clicks Timeline</h3>
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold">Activity Trend</span>
          </div>
          {timelineChartData.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] text-center py-20">No redirect traffic logged yet.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={9} tickLine={false} />
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
          )}
        </div>

        {/* Charts Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Browser Pie Chart */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Browser Share
            </h3>
            {browserChartData.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-20">No data.</p>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={browserChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {browserChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", color: "var(--text-secondary)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Device Pie Chart */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Device Types
            </h3>
            {deviceChartData.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-20">No data.</p>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {deviceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", color: "var(--text-secondary)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Countries Bar Chart */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Geological Countries
            </h3>
            {countryChartData.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-20">No location data.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryChartData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                    <XAxis type="number" stroke={axisColor} fontSize={9} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={9} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Bar name="Visits" dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Operating Systems Bar Chart */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Operating Systems
            </h3>
            {osChartData.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-20">No OS data.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={osChartData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                    <XAxis type="number" stroke={axisColor} fontSize={9} tickLine={false} />
                    <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={9} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Bar name="Visits" dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Traffic Sources Bar Chart */}
          <div className="saas-card border p-6 rounded-2xl space-y-4 md:col-span-2 shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b saas-border pb-3">
              Referrer Domains
            </h3>
            {referrerChartData.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-20">No referrer sources recorded.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={referrerChartData} margin={{ left: -25, right: 5, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" stroke={axisColor} fontSize={9} tickLine={false} />
                    <YAxis stroke={axisColor} fontSize={9} tickLine={false} />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Bar name="Clicks" dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

        {/* Live Visitor Feed Table */}
        <div className="saas-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b saas-border">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Visits</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Real-time log of the last 10 clicks recorded for this URL.</p>
          </div>
          
          <div className="overflow-x-auto">
            {recentVisits.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] py-12 text-center">No redirect visits have occurred yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-500/5 text-[var(--text-secondary)] font-bold border-b saas-border">
                    <th className="px-6 py-3.5">Time</th>
                    <th className="px-6 py-3.5">IP Address</th>
                    <th className="px-6 py-3.5">Browser & OS</th>
                    <th className="px-6 py-3.5">Device</th>
                    <th className="px-6 py-3.5">Referrer</th>
                    <th className="px-6 py-3.5 text-right">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y saas-border">
                  {recentVisits.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-500/5 transition">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">
                        {new Date(v.timestamp).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-6 py-4 font-mono text-[var(--text-secondary)] whitespace-nowrap">
                        {v.ip || "Direct Link"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                          {v.browser}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                          {v.os}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)] font-medium">
                        {v.device}
                      </td>
                      <td className="px-6 py-4 truncate max-w-[120px] text-[var(--text-secondary)]" title={v.referrer}>
                        {v.referrer}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                        {v.city && v.city !== "Localhost" ? `${v.city}, ` : ""}
                        {v.country || "Localhost"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
