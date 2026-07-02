import React from "react";

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, shortId, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="saas-card max-w-md w-full rounded-2xl border p-6 relative z-10 shadow-xl overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500"></div>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Delete Link</h3>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
          Are you sure you want to permanently delete short path{" "}
          <span className="font-extrabold text-[var(--text-primary)] font-mono">{shortId}</span>?
          This action cannot be undone. This link will stop redirecting immediately and its analytics will be lost.
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border saas-border text-[var(--text-secondary)] hover:bg-slate-500/5 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition shadow-md shadow-red-600/15 cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
