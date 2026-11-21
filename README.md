# MKD — Mobility Keeper Digital 🚗🏍️

<p align="center">
  <img src="public/logo-transparent.png" alt="MKD Logo" width="220" />
</p>

<p align="center">
  <strong>The Ultimate Next-Generation Telemetry, Fuel Economy, Maintenance & Compliance Suite for Vehicle Enthusiasts.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.3-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-Assets-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/License-MIT-a3e635?style=for-the-badge" alt="License" />
</p>

---

## 📖 The Chronicle: Why MKD?

> *"After evaluating numerous vehicle management platforms, I found that existing solutions fell short—either offering limited functionality and stability issues in free tiers, or locking essential tools behind costly paywalls. Rather than compromising, I decided to build a custom solution that consolidates the strongest features from each platform into a single, seamless application."*

---

## ✨ Key Capabilities

### 🏎️ Cockpit Instrument Cluster
- **Animated Digital Speedometer**: Dynamic multi-tier speed lighting (`0–60 km/h` Eco Green, `60–120 km/h` Power Orange, `120+ km/h` Redline alert).
- **Interactive Transmission Display**: Dynamic gear shifting indicator ($N \to 1 \dots 6$).
- **Cascading LED Tachometer Rev-Band**: Real-time RPM tracking with shift-point alerts.
- **Tumbler Odometer**: Vintage mechanical-style rolling digit animation reflecting total logged distance.

### ⛽ Fuel Ledger & Consumption Intelligence
- **Consecutive Fill-Up Mileage Engine**: Calculates real-world fuel economy (`km/L`), consumption rates (`L/100km`), and cost per kilometer (`₹/km`) between tank fill-ups.
- **Cumulative All-Time Telemetry**: Tracks lifelong distance traveled and baseline consumption metrics.
- **3-Way Interactive Refill Calculator**: Synchronizes liters, fuel unit price, and total amount spent in real time.
- **Monthly Refill Comparison**: Benchmarks current month expenses and fuel volume against prior monthly trends.

### 🛠️ Preventive Maintenance & Component Wear Life
- **Predictive Health Tracking**: Monitors wear levels for critical components (Engine Oil, Coolant, Chain Lube, Air Filter, Front/Rear Tyres, Battery, and Brake Pads) based on factory service intervals.
- **Dynamic Wear Gauges**: Visual progress meters with exact remaining distance before replacement or servicing is due.
- **One-Click Service Logging**: Direct service reset updates maintenance records seamlessly.

### 📅 Legal Compliance & Document Vault
- **Expiry Countdown Tracker**: Real-time expiry monitoring for Insurance, PUCC, Vehicle Registration, State Tax, Fitness Certificate, and Roadside Assistance (RSA).
- **Status Pills**: Instant color-coded badges for **Active**, **Expiring Soon (< 30 days)**, and **Expired** records.
- **Quick Renewal Logging**: Document number tracking, issuing authority records, and update actions.

### 📑 Comprehensive Themed PDF Reports
- **Instant Client-Side Vector PDF Engine**: Direct file download without external browser print dialogues or bloatware.
- **Flexible Time Horizons**: Default 3-Month filter with instant toggles for 1 Month, 6 Months, 1 Year, or Lifetime history.
- **All-Inclusive Export**: Includes vehicle specifications, odometer telemetry, fuel transaction ledger, maintenance logbook, component health states, and legal document compliance.

### 🌐 Edge-Ready & Offline Resilient
- **Offline-First Storage**: Seamless local persistent caching ensures full functionality without mandatory internet access.
- **Supabase Cloud Sync Ready**: Built-in support for cloud database sync with Row-Level Security (RLS).
- **Cloudflare Edge Deployment**: Pre-configured with `wrangler.json` for high-speed single-page application edge delivery.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) with Custom Dark Theme (`#a3e635` Lime Accents) |
| **Routing** | [React Router v7](https://reactrouter.com/) with SPA edge handling |
| **Icons & Charts** | [Lucide React](https://lucide.dev/) & [Recharts](https://recharts.org/) |
| **PDF Generation** | Pure Client-Side Vector PDF Engine (Embedded Type 1 fonts & vector graphics) |
| **Cloud & Deployment** | [Cloudflare Workers / Static Assets](https://developers.cloudflare.com/workers/) + [Supabase](https://supabase.com/) |
| **Linter & Formatter** | [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) (ultra-fast zero-warning linter) |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Mubashir12-a/VehicleManagement.git
cd VehicleManagement
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)
If connecting to your Supabase instance, create a `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
> *Note: The application operates completely offline with localStorage if Supabase is not configured.*

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

---

## ☁️ Deployment (Cloudflare)

This repository includes a pre-configured `wrangler.json` for Cloudflare Workers Static Assets:

```bash
# Deploy to Cloudflare
npx wrangler deploy --assets=./dist
```

---

## 📬 Connect & Feedback

- **Instagram**: [@0__.mubashir.__0](https://www.instagram.com/0__.mubashir.__0?hvrq=eGdrOGQ1NmgxbTdl)
- **WhatsApp**: [+91-7889825292](https://wa.me/917889825292)
- **Email**: [ma2625645@gmail.com](mailto:ma2625645@gmail.com)
- **Portfolio**: [Explore Creator Portfolio](#)
- **Suggestions & Feedback**: [Submit Ideas & Feedback](#)

---

## 📄 License

Distributed under the [MIT License](LICENSE). Built with dedication for automobile enthusiasts and daily commuters.
