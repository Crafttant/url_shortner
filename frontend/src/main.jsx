import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { ClerkProvider } from '@clerk/clerk-react'
import { ThemeProvider } from './context/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const API_URL = import.meta.env.VITE_API_URL

if (!PUBLISHABLE_KEY) {
  throw new Error("CRITICAL CONFIGURATION ERROR: Missing VITE_CLERK_PUBLISHABLE_KEY environment variable. Please configure it in your env settings.")
}
if (!API_URL) {
  throw new Error("CRITICAL CONFIGURATION ERROR: Missing VITE_API_URL environment variable. Please configure it in your env settings.")
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInUrl="/login" signUpUrl="/signup">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)
