import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

export default function QRModal({ isOpen, onClose, shortId }) {
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const getShortUrl = () => {
    const apiBase = import.meta.env.VITE_API_URL;
    return `${apiBase}/url/${shortId}`;
  };

  useEffect(() => {
    if (isOpen && shortId) {
      QRCode.toDataURL(
        getShortUrl(),
        {
          width: 300,
          margin: 2,
          color: {
            dark: "#0f172a", // slate-900 for high contrast dark pixels
            light: "#ffffff", // white background
          },
        },
        (err, url) => {
          if (err) {
            console.error("QR Code generation error:", err);
            setError("Failed to generate QR Code");
          } else {
            setQrUrl(url);
            setError("");
          }
        }
      );
    }
    // Reset copy state on open/change
    setCopySuccess(false);
  }, [isOpen, shortId]);

  if (!isOpen || !shortId) return null;

  // Copies the QR code PNG image itself to the clipboard
  const handleCopyQR = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy QR code image:", err);
      // Fallback: Copy short link
      navigator.clipboard.writeText(getShortUrl());
      alert("Failed to copy image. Short URL copied to clipboard instead!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="saas-card max-w-sm w-full rounded-2xl border p-6 relative z-10 shadow-xl overflow-hidden text-center animate-fade-in">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-600"></div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">QR Code Link</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <p className="text-rose-500 text-xs py-8">{error}</p>
        ) : (
          <div className="space-y-6 flex flex-col items-center">
            {qrUrl ? (
              <div className="p-3 bg-white border saas-border rounded-xl shadow-inner inline-block transition duration-200 hover:scale-[1.02]">
                <img
                  src={qrUrl}
                  alt="Short Link QR Code"
                  className="w-48 h-48 block"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-slate-500/10 rounded-xl skeleton-shimmer"></div>
            )}

            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400 truncate max-w-[280px]">
                {shortId}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] truncate max-w-[280px]">
                {getShortUrl()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              <button
                onClick={handleCopyQR}
                className="px-4 py-2.5 rounded-xl border saas-border text-xs font-semibold hover:bg-slate-500/5 text-[var(--text-primary)] transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>{copySuccess ? "📋 Copied!" : "📋 Copy Image"}</span>
              </button>
              {qrUrl && (
                <a
                  href={qrUrl}
                  download={`${shortId}-qr-code.png`}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-1.5"
                >
                  <span>⬇️ Download</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
