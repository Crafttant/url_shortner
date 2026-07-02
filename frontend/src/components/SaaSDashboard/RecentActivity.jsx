import React from "react";

export default function RecentActivity({ urls, loading }) {
  const activities = React.useMemo(() => {
    if (!urls) return [];

    const list = [];
    urls.forEach((url) => {
      // Add creation event
      if (url.createdAt) {
        list.push({
          id: `create-${url._id || url.shortId}`,
          type: "create",
          time: new Date(url.createdAt),
          text: `Short link created`,
          target: url.shortId,
        });
      }

      // Add click events
      if (url.visitHistory) {
        url.visitHistory.forEach((visit, index) => {
          list.push({
            id: `visit-${url._id || url.shortId}-${index}`,
            type: "click",
            time: new Date(visit.timestamp),
            text: `Link visited`,
            target: url.shortId,
          });
        });
      }
    });

    // Sort by timestamp descending
    return list.sort((a, b) => b.time - a.time).slice(0, 5);
  }, [urls]);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="saas-card rounded-2xl p-6 border flex-1 space-y-4">
        <div className="h-4 w-32 bg-slate-500/20 rounded skeleton-shimmer"></div>
        <div className="space-y-4 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-slate-500/20 skeleton-shimmer"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4 bg-slate-500/20 rounded skeleton-shimmer"></div>
                <div className="h-2 w-12 bg-slate-500/10 rounded skeleton-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card rounded-2xl p-6 border flex flex-col justify-between min-h-[350px] shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-5 tracking-tight">
          Recent Activity
        </h3>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl mb-2 text-slate-500">⚡</div>
            <p className="text-xs text-slate-400">No activity yet. Create a link to start tracking.</p>
          </div>
        ) : (
          <div className="relative border-l border-[var(--border-color)] ml-4 space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-7 group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[13px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border saas-border transition duration-200 ${
                    act.type === "create"
                      ? "bg-blue-600/10 border-blue-600/30 text-blue-500"
                      : "bg-purple-600/10 border-purple-600/30 text-purple-500"
                  } group-hover:scale-110`}
                >
                  {act.type === "create" ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                    </svg>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {act.text}{" "}
                    <span className="text-indigo-400 hover:underline cursor-pointer font-bold ml-0.5">
                      {act.target}
                    </span>
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-1.5">
                    {formatTimeAgo(act.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
