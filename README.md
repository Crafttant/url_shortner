# QuickLink SaaS - Premium URL Shortener & Analytics

QuickLink SaaS is a feature-rich, high-performance, and modern URL shortener built for developers and businesses. It features user authentication, custom link expiration dates, browser/device tracking, geolocated visitor mapping, and real-time dashboard analytics that support automatic sync and dark/light modes.

---

## 🚀 Key Features

*   **Premium URL Shortening**: Create shortened URLs with custom aliases and custom expiration times.
*   **Dynamic Expiration Picker**: Premium React-based custom popover calendar and time picker for setting link validity limits.
*   **Live Analytics Sync**: Automatically fetches and refreshes click stats, timeline trends, and visitors every 3 seconds, including instant tab/window focus refetching.
*   **Vercel & Plausible Style Dashboards**: Simplified and highly readable KPI analytics overview with horizontal percentage progress indicators for browser, device, country, and link distributions.
*   **Geo-IP Visitor Mapping**: Integrates native, timeout-safe Geo-IP lookups to track clicks globally. Automatically maps local test environments to the developer's physical country and city.
*   **Reliable Browser Detection**: Leverages User-Agent Client Hints to accurately detect modern browsers, including Brave browser.
*   **Authentication & Security**: Clerk integration for secure sign-ups, profile settings, and login workflows with high-contrast social buttons.
*   **Flawless Themes**: Responsive design with clean Light and Dark mode styles.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS / Vanilla CSS
- **State & Data Fetching**: TanStack React Query v5 (with window focus refetching and background polling)
- **Authentication**: `@clerk/clerk-react`

### Backend
- **Runtime & Framework**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **User Parsing**: `ua-parser-js` & User-Agent Client Hints
- **Authentication Middleware**: `@clerk/express`

---

## 📦 Project Directory Structure

```text
URL-shortner/
├── backend/            # Express.js REST API
│   ├── controllers/    # API controllers (URL management & metrics aggregation)
│   ├── models/         # Mongoose schemas (URL, Visit Log)
│   ├── routes/         # Router handlers
│   └── index.js        # Main Express application entrypoint
├── frontend/           # Vite + React Client
│   ├── src/
│   │   ├── components/ # Reusable UI (DateTimePicker, URLTable, Side Panels)
│   │   ├── context/    # Global Context Providers (Theme Mode)
│   │   ├── hooks/      # React Query query/mutation hooks
│   │   ├── pages/      # Pages (Home Dashboard, Analytics, Profile, Signin/Signup)
│   │   └── main.jsx    # Client entry point
│   └── index.html      # Shell page
└── .gitignore          # Global Git Exclusions
```

---

## ⚙️ Environment Configuration

Set up local `.env` files in both directories before running:

### Backend Configuration (`/backend/.env`)
```env
PORT=8001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/URL-SHORTNER
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Frontend Configuration (`/frontend/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:8001
```

---

## ⚡ Setup & Run Instructions

To install dependencies and start both servers locally, execute the following commands in your terminal:

### 1. Launch the Backend API
```bash
cd backend
npm install
npm start
```
*The server will start at `http://localhost:8001/` using nodemon.*

### 2. Launch the Frontend Dev Client
```bash
cd frontend
npm install
npm run dev
```
*The development client will run at `http://localhost:5173/` with hot-module reloading enabled.*
