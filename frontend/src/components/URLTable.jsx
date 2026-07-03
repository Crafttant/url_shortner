import React, { useState } from "react";
import { Link } from "react-router-dom";
import EditURLModal from "./SaaSDashboard/EditURLModal";
import ConfirmDeleteModal from "./SaaSDashboard/ConfirmDeleteModal";
import QRModal from "./SaaSDashboard/QRModal";

export default function URLTable({
  urls,
  onToggleFavorite,
  onToggleArchive,
  onEditSave,
  onDeleteConfirm,
  isSaving,
  isDeleting,
}) {
  const [selectedEditUrl, setSelectedEditUrl] = useState(null);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [selectedQRId, setSelectedQRId] = useState(null);

  const getShortUrl = (id) => {
    const apiBase = import.meta.env.VITE_API_URL;
    return `${apiBase}/url/${id}`;
  };

  const getStatusBadge = (url) => {
    if (url.isArchived) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Archived
        </span>
      );
    }
    if (!url.expiresAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Permanent
        </span>
      );
    }
    const isExpired = new Date(url.expiresAt) < new Date();
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          Expired
        </span>
      );
    }
    const dateStr = new Date(url.expiresAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"
        title={`Expires on ${new Date(url.expiresAt).toLocaleString()}`}
      >
        Expires {dateStr}
      </span>
    );
  };

  if (!urls || urls.length === 0) {
    return (
      <div className="saas-card rounded-2xl p-12 text-center border mt-8 max-w-4xl mx-auto shadow-sm">
        <div className="text-4xl mb-3 text-slate-500">🔗</div>
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">No links matched</h3>
        <p className="text-[var(--text-secondary)] text-xs">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <>
      <div className="saas-card rounded-2xl border mt-8 max-w-4xl mx-auto shadow-sm overflow-hidden animate-fade-in">
        <div className="px-6 py-4.5 border-b saas-border bg-slate-900/5">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">URL Management Panel</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-500/10 border-b saas-border text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                <th className="px-5 py-4 w-12 text-center">Fav</th>
                <th className="px-5 py-4">Short Path</th>
                <th className="px-5 py-4">Destination Link</th>
                <th className="px-5 py-4 text-center w-24">Status</th>
                <th className="px-5 py-4 text-center w-20">Clicks</th>
                <th className="px-5 py-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y saas-border text-sm text-[var(--text-primary)]">
              {urls.map((url) => (
                <tr
                  key={url._id || url.shortId}
                  className="hover:bg-slate-500/5 transition duration-150"
                >
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => onToggleFavorite(url.shortId)}
                      className="p-1 rounded hover:bg-slate-500/10 transition cursor-pointer text-base"
                      title={url.isFavorite ? "Remove Favorite" : "Favorite Link"}
                    >
                      {url.isFavorite ? (
                        <span className="text-yellow-400">★</span>
                      ) : (
                        <span className="text-slate-400 hover:text-yellow-400">☆</span>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 font-semibold font-mono text-indigo-500 dark:text-indigo-400">
                    <div className="flex items-center space-x-2">
                      <a
                        href={getShortUrl(url.shortId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {url.shortId}
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getShortUrl(url.shortId));
                          alert("Link copied!");
                        }}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 hover:bg-slate-500/15 rounded transition cursor-pointer text-xs"
                        title="Copy Link"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-xs truncate text-xs text-[var(--text-secondary)]">
                    <a
                      href={url.redirectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-[var(--text-primary)]"
                    >
                      {url.redirectURL}
                    </a>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {getStatusBadge(url)}
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-[var(--text-secondary)]">
                    {url.clicksCount || url.visitHistory?.length || 0}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {/* QR Code Button */}
                      <button
                        onClick={() => setSelectedQRId(url.shortId)}
                        className="p-1.5 rounded-lg border saas-border hover:bg-slate-500/10 text-slate-400 hover:text-emerald-500 transition cursor-pointer"
                        title="View QR Code"
                      >
                        📱
                      </button>

                      {/* Analytics Button */}
                      <Link
                        to={`/analytics/${url.shortId}`}
                        className="p-1.5 rounded-lg border saas-border hover:bg-slate-500/10 text-slate-400 hover:text-indigo-400 transition cursor-pointer flex items-center justify-center"
                        title="View Analytics"
                      >
                        📈
                      </Link>

                      {/* Edit Button */}
                      <button
                        onClick={() => setSelectedEditUrl(url)}
                        className="p-1.5 rounded-lg border saas-border hover:bg-slate-500/10 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                        title="Edit Link"
                      >
                        ✏️
                      </button>

                      {/* Archive Button */}
                      <button
                        onClick={() => onToggleArchive(url.shortId)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          url.isArchived
                            ? "bg-purple-600/15 border-purple-500/30 text-purple-400"
                            : "saas-border hover:bg-slate-500/10 text-slate-400 hover:text-purple-400"
                        }`}
                        title={url.isArchived ? "Restore Link" : "Archive Link"}
                      >
                        📦
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setSelectedDeleteId(url.shortId)}
                        className="p-1.5 rounded-lg border saas-border hover:bg-slate-500/10 text-slate-400 hover:text-red-500 transition cursor-pointer"
                        title="Delete Link"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit URL Modal */}
      <EditURLModal
        isOpen={!!selectedEditUrl}
        onClose={() => setSelectedEditUrl(null)}
        urlEntry={selectedEditUrl}
        isSaving={isSaving}
        onSave={(data) => {
          onEditSave(data);
          setSelectedEditUrl(null);
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!selectedDeleteId}
        onClose={() => setSelectedDeleteId(null)}
        shortId={selectedDeleteId}
        isDeleting={isDeleting}
        onConfirm={async () => {
          await onDeleteConfirm(selectedDeleteId);
          setSelectedDeleteId(null);
        }}
      />

      {/* QR Code Modal */}
      <QRModal
        isOpen={!!selectedQRId}
        onClose={() => setSelectedQRId(null)}
        shortId={selectedQRId}
      />
    </>
  );
}
