import React from "react";

export default function MostClickedLink({ urls, loading }) {
  const topLink = React.useMemo(() => {
    if (!urls || urls.length === 0) return null;
    return [...urls].sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))[0];
  }, [urls]);

  const getShortUrl = (id) => {
    const apiBase = import.meta.env.VITE_API_URL;
    return `${apiBase}/url/${id}`;
  };

  if (loading) {
    return (
      <div className="saas-card rounded-2xl p-6 border flex-1 space-y-4">
        <div className="h-4 w-40 bg-slate-500/20 rounded skeleton-shimmer"></div>
        <div className="p-4 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-3">
          <div className="h-5 w-24 bg-slate-500/20 rounded skeleton-shimmer"></div>
          <div className="h-3 w-48 bg-slate-500/10 rounded skeleton-shimmer"></div>
          <div className="h-8 w-16 bg-slate-500/20 rounded skeleton-shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card rounded-2xl p-6 border flex flex-col justify-between min-h-[350px] shadow-sm relative overflow-hidden group">
      {/* Decorative gradient orb background inside card */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-indigo-500/5 blur-xl group-hover:scale-125 transition-transform duration-300"></div>

      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-5 tracking-tight">
          Top Performing Link
        </h3>

        {!topLink ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="text-3xl mb-2 text-slate-500">🏆</div>
            <p className="text-xs text-slate-400">No data available yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-4.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Active Leader
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getShortUrl(topLink.shortId));
                      alert("Copied to clipboard!");
                    }}
                    className="p-1.5 rounded-lg border saas-border bg-slate-500/5 hover:bg-slate-500/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                    title="Copy short link"
                  >
                    📋
                  </button>
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] truncate">
                  {topLink.shortId}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 truncate max-w-[220px]">
                  {topLink.redirectURL}
                </p>
              </div>

              <div className="flex items-baseline space-x-1.5 mt-4">
                <span className="text-3xl font-black text-indigo-400 leading-none">
                  {topLink.clicksCount || 0}
                </span>
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  Clicks
                </span>
              </div>
            </div>

            <div className="text-xs text-[var(--text-secondary)] leading-relaxed bg-slate-500/5 p-3 rounded-lg saas-border border">
              📈 This link accounts for{" "}
              <span className="font-bold text-[var(--text-primary)]">
                {urls.reduce((sum, url) => sum + (url.clicksCount || 0), 0) > 0
                  ? Math.round(
                      ((topLink.clicksCount || 0) /
                        urls.reduce((sum, url) => sum + (url.clicksCount || 0), 0)) *
                        100
                    )
                  : 0}
                %
              </span>{" "}
              of your account's total click traffic.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
