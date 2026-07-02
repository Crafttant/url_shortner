import React from "react";
import { UserProfile } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="glowing-bg"></div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Manage Profile
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-2">
          Update your account details, change passwords, and configure social logins.
        </p>
      </div>

      <div className={`flex justify-center rounded-2xl overflow-hidden border shadow-2xl backdrop-blur-md p-1 md:p-6 ${
        isDark ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-white/70"
      }`}>
        <UserProfile
          appearance={{
            variables: {
              colorPrimary: "#6366f1",
              colorBackground: isDark ? "#0b0f19" : "#ffffff",
              colorText: isDark ? "#f1f5f9" : "#0f172a",
              colorTextSecondary: isDark ? "#94a3b8" : "#64748b",
              colorBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              colorInputBackground: isDark ? "rgba(30,41,59,0.5)" : "#f8fafc",
              colorInputText: isDark ? "#f1f5f9" : "#0f172a"
            },
            elements: {
              cardBox: "shadow-none w-full max-w-full",
              card: "bg-transparent border-0 shadow-none w-full",
              navbar: `border-r bg-transparent pr-4 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`,
              scrollBox: "bg-transparent",
              headerTitle: isDark ? "text-slate-100" : "text-slate-900",
              headerSubtitle: isDark ? "text-slate-400" : "text-slate-500",
              profileSectionTitle: `border-b pb-2 text-indigo-400 ${isDark ? 'border-slate-800' : 'border-slate-200'}`,
              accordion: isDark ? "bg-slate-950/40 border border-slate-800" : "bg-slate-50 border border-slate-200",
              breadcrumbsItem: isDark ? "text-slate-300" : "text-slate-600",
              breadcrumbsItemActive: "text-indigo-400",
              formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition duration-200 cursor-pointer text-xs uppercase tracking-wider",
              profileSectionTitleText: isDark ? "text-slate-100" : "text-slate-900",
              formFieldLabel: isDark ? "text-slate-300" : "text-slate-700",
              formFieldInput: isDark 
                ? "border border-slate-800 text-slate-200 bg-slate-950/50" 
                : "border border-slate-200 text-slate-800 bg-slate-50",
            }
          }}
        />
      </div>
    </div>
  );
}
