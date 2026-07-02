import React from "react";
import { SignUp } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";

export default function Signup() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="glowing-bg"></div>
      <div className={`glass-panel rounded-2xl border shadow-2xl p-1 md:p-4 backdrop-blur-md transition-all duration-300 ${
        isDark ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-white/70"
      }`}>
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
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
              cardBox: "shadow-none",
              card: "bg-transparent border-0 shadow-none",
              headerTitle: isDark ? "text-slate-100 font-extrabold tracking-tight" : "text-slate-900 font-extrabold tracking-tight",
              headerSubtitle: isDark ? "text-slate-400 text-sm mt-2" : "text-slate-500 text-sm mt-2",
              socialButtonsBlockButton: isDark 
                ? "border border-slate-850 bg-slate-950/20 hover:bg-slate-900 text-slate-300 font-medium"
                : "border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium",
              socialButtonsBlockButton__github: isDark 
                ? "border border-slate-700 bg-slate-800 text-white font-medium hover:bg-slate-700 shadow-inner" 
                : "border border-slate-300 bg-slate-900 text-white font-medium hover:bg-slate-800 shadow-sm",
              socialButtonsBlockButtonText: isDark ? "text-slate-300" : "text-slate-700",
              socialButtonsBlockButtonText__github: "text-white",
              dividerLine: isDark ? "bg-slate-800" : "bg-slate-200",
              dividerText: isDark ? "text-slate-500" : "text-slate-400",
              formFieldLabel: isDark ? "text-slate-300 font-semibold uppercase tracking-wider text-[10px]" : "text-slate-600 font-semibold uppercase tracking-wider text-[10px]",
              formFieldInput: isDark 
                ? "glass-input rounded-xl border border-slate-800 text-slate-200 outline-none focus:ring-2 placeholder-slate-600 text-sm bg-slate-950/50" 
                : "rounded-xl border border-slate-200 text-slate-800 outline-none focus:ring-2 placeholder-slate-400 text-sm bg-slate-50",
              formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition duration-200 cursor-pointer text-xs uppercase tracking-wider",
              footerActionLink: "text-indigo-400 hover:text-indigo-300 hover:underline",
              footerText: isDark ? "text-slate-400" : "text-slate-500"
            }
          }}
        />
      </div>
    </div>
  );
}
