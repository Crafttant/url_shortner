import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import { setTokenLoader } from "./api/axios";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import AnalyticsOverview from "./pages/AnalyticsOverview";

function ClerkTokenLoader({ children }) {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenLoader(getToken);
  }, [getToken]);
  return children;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ClerkTokenLoader>
        <Router>
          <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 flex">
            
            {/* Render sidebar only for signed in users */}
            <SignedIn>
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </SignedIn>

            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
              <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
              <main className="flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        <SignedIn>
                          <Home />
                        </SignedIn>
                        <SignedOut>
                          <RedirectToSignIn />
                        </SignedOut>
                      </>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <>
                        <SignedIn>
                          <Profile />
                        </SignedIn>
                        <SignedOut>
                          <RedirectToSignIn />
                        </SignedOut>
                      </>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <>
                        <SignedIn>
                          <AnalyticsOverview />
                        </SignedIn>
                        <SignedOut>
                          <RedirectToSignIn />
                        </SignedOut>
                      </>
                    }
                  />
                  <Route
                    path="/analytics/:shortId"
                    element={
                      <>
                        <SignedIn>
                          <Analytics />
                        </SignedIn>
                        <SignedOut>
                          <RedirectToSignIn />
                        </SignedOut>
                      </>
                    }
                  />
                  <Route path="/login/*" element={<Login />} />
                  <Route path="/signup/*" element={<Signup />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </ClerkTokenLoader>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#f3f4f6",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "12.5px",
            fontWeight: "600",
            borderRadius: "12px",
          },
        }}
      />
    </ErrorBoundary>
  );
}
