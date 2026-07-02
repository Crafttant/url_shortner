import React from "react";

export default function StatsGrid({ urls, stats: passedStats, loading }) {
  const stats = React.useMemo(() => {
    if (passedStats) return passedStats;
    if (!urls) return { total: 0, clicks: 0, active: 0, expired: 0, favorites: 0 };

    const now = new Date();
    let total = urls.length;
    let clicks = 0;
    let active = 0;
    let expired = 0;
    let favorites = 0;

    urls.forEach((url) => {
      clicks += url.clicksCount || url.visitHistory?.length || 0;
      
      const isExpired = url.expiresAt && new Date(url.expiresAt) < now;
      if (isExpired) {
        expired++;
      } else {
        active++;
      }

      if (url.isFavorite) {
        favorites++;
      }
    });

    return { total, clicks, active, expired, favorites };
  }, [urls, passedStats]);

  const cards = [
    {
      label: "Total Links",
      value: stats.total,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: "from-blue-500 to-indigo-500",
      bgLight: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Clicks",
      value: stats.clicks,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
      bgLight: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Active Links",
      value: stats.active,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-emerald-500 to-teal-500",
      bgLight: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Expired Links",
      value: stats.expired,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-amber-500 to-rose-500",
      bgLight: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Favorites",
      value: stats.favorites,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.974 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.89a1 1 0 00-1.176 0l-3.976 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.976-2.89c-.77-.57-.372-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
        </svg>
      ),
      color: "from-yellow-400 to-amber-500",
      bgLight: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="saas-card rounded-2xl p-5 border flex items-center justify-between overflow-hidden relative"
          >
            <div className="space-y-2.5 w-2/3">
              <div className="h-3 w-16 bg-slate-500/20 rounded skeleton-shimmer"></div>
              <div className="h-8 w-10 bg-slate-500/30 rounded-lg skeleton-shimmer"></div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-500/20 skeleton-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="saas-card saas-card-hover rounded-2xl p-5 border relative overflow-hidden group flex flex-col justify-between"
        >
          {/* Subtle colored glow top border */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.color}`}></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`p-2.5 rounded-xl border ${card.bgLight} transition duration-300 group-hover:scale-110`}>
              {card.icon}
            </div>
          </div>

          <div>
            <span className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {card.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
