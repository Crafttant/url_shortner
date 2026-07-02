import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useURLMutations } from "../hooks/useURLMutations";
import { useURLs, useAllURLs } from "../hooks/useURLQueries";
import API from "../api/axios";
import URLForm from "../components/URLForm";
import URLTable from "../components/URLTable";
import StatsGrid from "../components/SaaSDashboard/StatsGrid";
import RecentActivity from "../components/SaaSDashboard/RecentActivity";
import MostClickedLink from "../components/SaaSDashboard/MostClickedLink";

export default function Home() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all", "favorites", "active", "expired", "archived"
  const [sort, setSort] = useState("latest"); // "latest", "most-clicked", "oldest"

  const queryClient = useQueryClient();
  const { favoriteMutation, archiveMutation, editMutation, deleteMutation } = useURLMutations();

  // Debounce search query to prevent excessive API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated, filtered, and sorted URLs via Custom Hook
  const { data, isLoading, isError, error } = useURLs({
    page,
    limit,
    search: debouncedSearch,
    filter: filterType,
    sort,
  });

  // Fetch all user URLs (unpaginated) for RecentActivity & MostClickedLink side panels via Custom Hook
  const { data: allUrlsData, isLoading: isLoadingAll } = useAllURLs();

  // Helper callback when a URL is added
  const handleURLAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["urls"] });
    queryClient.invalidateQueries({ queryKey: ["allUrls"] });
    queryClient.invalidateQueries({ queryKey: ["globalAnalytics"] });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="glowing-bg"></div>

      {/* Stats Grid using pre-computed overall stats */}
      <StatsGrid
        urls={allUrlsData}
        stats={data?.stats}
        loading={isLoading && !data}
      />

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <URLForm onURLAdded={handleURLAdded} />

          {/* Search, Sort and Filter Bar */}
          <div className="saas-card rounded-2xl p-5 border flex flex-col xl:flex-row gap-4 items-center justify-between shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full xl:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search short ID or URL..."
                className="w-full pl-9 pr-4 py-2 rounded-xl saas-input text-xs outline-none focus:ring-2 placeholder-slate-500"
              />
              <svg
                className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Sorting & Category Tabs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
              
              {/* Sort Selector */}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-40 px-3.5 py-1.5 rounded-xl saas-input text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] outline-none cursor-pointer"
              >
                <option value="latest" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Sort: Latest</option>
                <option value="most-clicked" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Sort: Most Clicked</option>
                <option value="oldest" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Sort: Oldest</option>
              </select>

              {/* Filter Tabs */}
              <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All" },
                  { id: "favorites", label: "★ Favorites" },
                  { id: "active", label: "Active" },
                  { id: "expired", label: "Expired" },
                  { id: "archived", label: "Archived" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => {
                      setFilterType(btn.id);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition duration-150 whitespace-nowrap ${
                      filterType === btn.id
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-slate-500/5 hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {isError && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-center text-xs">
              Error fetching links: {error?.message || "Please reload."}
            </div>
          )}

          {/* Table Container */}
          <div className="space-y-4">
            {isLoading && !data ? (
              <div className="saas-card rounded-2xl border p-8 shadow-sm">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="h-6 w-8 bg-slate-500/10 rounded skeleton-shimmer"></div>
                      <div className="h-6 w-32 bg-slate-500/20 rounded skeleton-shimmer"></div>
                      <div className="h-6 flex-1 bg-slate-500/10 rounded skeleton-shimmer"></div>
                      <div className="h-6 w-16 bg-slate-500/20 rounded skeleton-shimmer"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <URLTable
                  urls={data?.urls}
                  onToggleFavorite={(id) => favoriteMutation.mutate(id)}
                  onToggleArchive={(id) => archiveMutation.mutate(id)}
                  onEditSave={(payload) => editMutation.mutate(payload)}
                  onDeleteConfirm={(id) => deleteMutation.mutate(id)}
                  isSaving={editMutation.isLoading || editMutation.isPending}
                  isDeleting={deleteMutation.isLoading || deleteMutation.isPending}
                />

                {/* Pagination Controls */}
                {data?.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 saas-card rounded-2xl border bg-slate-900/5 shadow-sm">
                    
                    {/* Showing stats and Limit Selection */}
                    <div className="flex items-center space-x-4">
                      <div className="text-xs text-[var(--text-secondary)]">
                        Showing <span className="font-bold text-[var(--text-primary)]">{(page - 1) * limit + 1}</span> to{" "}
                        <span className="font-bold text-[var(--text-primary)]">
                          {Math.min(page * limit, data.pagination.total)}
                        </span>{" "}
                        of <span className="font-bold text-[var(--text-primary)]">{data.pagination.total}</span> links
                      </div>

                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(parseInt(e.target.value));
                          setPage(1);
                        }}
                        className="bg-[var(--bg-primary)] border saas-border rounded-lg text-[10px] font-bold text-[var(--text-secondary)] px-2 py-1.5 outline-none cursor-pointer"
                      >
                        <option value={5} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">5 per page</option>
                        <option value={10} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">10 per page</option>
                        <option value={20} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">20 per page</option>
                      </select>
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 rounded-lg border saas-border text-xs font-semibold hover:bg-slate-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Previous
                      </button>

                      {[...Array(data.pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition duration-150 ${
                              page === pageNum
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                : "saas-border text-[var(--text-secondary)] hover:bg-slate-500/5"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        disabled={page === data.pagination.totalPages}
                        onClick={() => setPage((p) => Math.min(p + 1, data.pagination.totalPages))}
                        className="px-3 py-1.5 rounded-lg border saas-border text-xs font-semibold hover:bg-slate-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Next
                      </button>
                    </div>

                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-8">
          <MostClickedLink urls={allUrlsData} loading={isLoadingAll} />
          <RecentActivity urls={allUrlsData} loading={isLoadingAll} />
        </div>

      </div>
    </div>
  );
}
