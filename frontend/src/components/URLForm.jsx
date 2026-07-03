import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import API from "../api/axios";
import DateTimePicker from "./DateTimePicker";

export default function URLForm({ onURLAdded }) {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expirationPreset, setExpirationPreset] = useState("never");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState("");
  const [successQrUrl, setSuccessQrUrl] = useState("");

  const queryClient = useQueryClient();

  const shortenMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await API.post("/url", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.id) {
        setSuccessId(data.id);
        
        // Generate QR code for success preview block
        const shortUrlStr = getShortUrl(data.id);
        QRCode.toDataURL(
          shortUrlStr,
          {
            width: 180,
            margin: 1,
            color: {
              dark: "#0f172a",
              light: "#ffffff",
            },
          },
          (err, qr) => {
            if (!err) {
              setSuccessQrUrl(qr);
            }
          }
        );

        setUrl("");
        setCustomAlias("");
        setExpirationPreset("never");
        setExpiresAt("");
        
        // Notify user
        toast.success("Short URL created successfully!");
        
        // Invalidate URL queries to refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ["urls"] });
        queryClient.invalidateQueries({ queryKey: ["allUrls"] });
        queryClient.invalidateQueries({ queryKey: ["globalAnalytics"] });
        if (onURLAdded) {
          onURLAdded();
        }
      }
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error || "Failed to shorten URL. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessId("");
    setSuccessQrUrl("");

    if (!url.trim()) {
      setError("Please enter a valid URL.");
      toast.error("Please enter a valid URL.");
      return;
    }

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

    shortenMutation.mutate({
      url,
      customAlias: customAlias.trim() || null,
      expiresAt: calculatedExpiry,
    });
  };

  const getShortUrl = (id) => {
    const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, "") : "";
    return `${apiBase}/url/${id}`;
  };

  const handleCopyQR = async () => {
    if (!successQrUrl) return;
    try {
      const response = await fetch(successQrUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast.success("QR code image copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy image to clipboard.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShortUrl(successId));
    toast.success("Short URL copied to clipboard!");
  };

  return (
    <div className="saas-card rounded-2xl p-8 shadow-xl max-w-4xl mx-auto border">
      <h2 className="text-xl font-bold mb-1 text-[var(--text-primary)]">Shorten a new URL</h2>
      <p className="text-[var(--text-secondary)] text-xs mb-6">Enter your long destination URL, choose a custom alias, and set optional expiration options.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url-path"
            required
            className="md:col-span-2 px-4 py-3 rounded-xl saas-input outline-none focus:ring-2 placeholder-slate-500 text-sm"
          />
          <input
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="custom-alias (Optional)"
            className="px-4 py-3 rounded-xl saas-input outline-none focus:ring-2 placeholder-slate-500 text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <select
              value={expirationPreset}
              onChange={(e) => {
                setExpirationPreset(e.target.value);
                if (e.target.value !== "custom") setExpiresAt("");
              }}
              className="flex-1 px-4 py-3 rounded-xl saas-input outline-none focus:ring-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-primary)] cursor-pointer min-w-[150px]"
            >
              <option value="never" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Never Expire</option>
              <option value="1day" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">1 Day Expiry</option>
              <option value="7days" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">7 Days Expiry</option>
              <option value="30days" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">30 Days Expiry</option>
              <option value="custom" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Custom Date & Time</option>
            </select>
            {expirationPreset === "custom" && (
              <DateTimePicker
                value={expiresAt}
                onChange={(val) => setExpiresAt(val)}
                placeholder="Pick expiration date & time"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={shortenMutation.isLoading || shortenMutation.isPending}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition duration-200 shadow-md shadow-indigo-900/30 flex items-center justify-center min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-bold"
          >
            {shortenMutation.isLoading || shortenMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Shorten URL"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm rounded-xl">
          {error}
        </div>
      )}

      {successId && (
        <div className="mt-6 p-5 bg-emerald-950/45 border border-emerald-800/40 rounded-2xl flex flex-col md:flex-row gap-5 items-center animate-fade-in shadow-inner">
          {successQrUrl && (
            <div className="p-2 bg-white border border-emerald-800/20 rounded-xl shadow-md shrink-0">
              <img
                src={successQrUrl}
                alt="QR Code"
                className="w-24 h-24 block"
              />
            </div>
          )}

          <div className="flex-1 space-y-3 w-full">
            <div>
              <p className="text-emerald-400 text-xs font-bold mb-1 uppercase tracking-wider">URL Shortened Successfully!</p>
              <a
                href={getShortUrl(successId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:underline text-base font-black truncate block max-w-sm sm:max-w-md md:max-w-lg"
              >
                {getShortUrl(successId)}
              </a>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer font-semibold"
              >
                📋 Copy Link
              </button>

              {successQrUrl && (
                <>
                  <button
                    onClick={handleCopyQR}
                    className="px-3.5 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer font-semibold"
                  >
                    🖼️ Copy QR Image
                  </button>
                  <a
                    href={successQrUrl}
                    download={`${successId}-qr-code.png`}
                    className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition cursor-pointer font-bold inline-flex items-center"
                  >
                    ⬇️ Download QR
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
