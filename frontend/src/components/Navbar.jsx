import React from "react";
import { Link } from "react-router-dom";
import { UserButton, useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ onToggleSidebar }) {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="saas-card sticky top-0 z-40 px-6 py-4 border-b shadow-sm backdrop-blur-md bg-opacity-70 dark:bg-opacity-70">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Left section: Hamburger (mobile) + Branding */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl border saas-border hover:bg-slate-500/5 lg:hidden text-slate-400 hover:text-slate-200 cursor-pointer transition"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </SignedIn>

          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
              ⚡ QuickLink
            </span>
          </Link>
        </div>

        {/* Right section: Theme Toggle + User Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border saas-border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5 transition cursor-pointer"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              // Sun icon for dark mode -> switch to light
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              // Moon icon for light mode -> switch to dark
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <SignedIn>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-[var(--text-secondary)] hidden sm:inline">
                Hi, <span className="text-indigo-500 dark:text-indigo-400 font-bold">{user?.firstName || user?.username || "User"}</span>
              </span>
              <UserButton
                appearance={{
                  elements: {
                    userButtonTrigger: "hover:scale-105 transition duration-150 border-2 border-indigo-500/20"
                  }
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-indigo-500 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          </SignedOut>
        </div>

      </div>
    </nav>
  );
}
