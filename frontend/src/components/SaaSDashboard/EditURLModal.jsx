import React, { useState, useEffect } from "react";
import DateTimePicker from "../DateTimePicker";

export default function EditURLModal({ isOpen, onClose, urlEntry, onSave, isSaving }) {
  const [redirectURL, setRedirectURL] = useState("");
  const [expirationPreset, setExpirationPreset] = useState("never");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (urlEntry) {
      setRedirectURL(urlEntry.redirectURL || "");
      if (urlEntry.expiresAt) {
        setExpirationPreset("custom");
        // Convert to YYYY-MM-DDTHH:MM local format for datetime-local input
        const d = new Date(urlEntry.expiresAt);
        const pad = (num) => String(num).padStart(2, "0");
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setExpiresAt(formatted);
      } else {
        setExpirationPreset("never");
        setExpiresAt("");
      }
    }
  }, [urlEntry, isOpen]);

  if (!isOpen || !urlEntry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!redirectURL.trim()) return;

    let calculatedExpiry = null;
    if (expirationPreset === "1day") {
      calculatedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationPreset === "7days") {
      calculatedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationPreset === "30days") {
      calculatedExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationPreset === "custom" && expiresAt) {
      calculatedExpiry = new Date(expiresAt).toISOString();
    }

    onSave({
      shortId: urlEntry.shortId,
      redirectURL,
      expiresAt: calculatedExpiry,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="saas-card max-w-lg w-full rounded-2xl border p-6 relative z-10 shadow-xl overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-600"></div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Edit Shortened URL</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Short Path ID
            </label>
            <input
              type="text"
              value={urlEntry.shortId}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border saas-border bg-slate-500/5 text-slate-500 text-sm cursor-not-allowed outline-none font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Destination URL
            </label>
            <input
              type="url"
              required
              value={redirectURL}
              onChange={(e) => setRedirectURL(e.target.value)}
              placeholder="https://example.com/very-long-link"
              className="w-full px-4 py-2.5 rounded-xl saas-input text-sm outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Link Expiration Preset
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={expirationPreset}
                onChange={(e) => {
                  setExpirationPreset(e.target.value);
                  if (e.target.value !== "custom") setExpiresAt("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl saas-input outline-none focus:ring-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] cursor-pointer"
              >
                <option value="never" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Never Expire</option>
                <option value="1day" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">1 Day Expiry</option>
                <option value="7days" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">7 Days Expiry</option>
                <option value="30days" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">30 Days Expiry</option>
                <option value="custom" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">Custom Date & Time</option>
              </select>
              {expirationPreset === "custom" && (
                <DateTimePicker
                  value={expiresAt}
                  onChange={(val) => setExpiresAt(val)}
                  placeholder="Pick expiration date & time"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border saas-border text-[var(--text-secondary)] hover:bg-slate-500/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
