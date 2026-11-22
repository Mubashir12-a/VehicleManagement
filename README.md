# MKD — Mobility Keeper Digital 🚗🏍️

<p align="center">
  <img src="public/logo-transparent.png" alt="MKD Logo" width="220" />
</p>

<p align="center">
  <strong>The Ultimate Next-Generation Telemetry, Fuel Economy, Multi-Vehicle Garage, Maintenance & Compliance Suite for Automobile Enthusiasts.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.3-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Supabase-Auth_%26_RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-Assets-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/License-MIT-a3e635?style=for-the-badge" alt="License" />
</p>

---

## 📖 The Chronicle: Why MKD?

> *"After evaluating numerous vehicle management platforms, I found that existing solutions fell short—either offering limited functionality and stability issues in free tiers, or locking essential tools behind costly paywalls. Rather than compromising, I decided to build a custom solution that consolidates the strongest features from each platform into a single, seamless application."*

---

## ✨ Key Capabilities

### 🔐 User Authentication & Multi-Tenant Cloud Isolation
- **Supabase Authentication**: Integrated Email & Password signup and login with token-based session persistence.
- **Strict Row-Level Security (RLS)**: Every user's vehicles, fuel ledger, service checkpoints, modifications, and documents are cryptographically isolated.
- **Account Safeguards**: Immediate duplicate email detection and intelligent guidance to Sign In.
- **Clean Default State**: Every newly created garage starts with unpolluted default telemetry (`0` metrics, `'None'` text placeholders, `'DD-MM-YYYY'` standardized date formats).

### 🏎️ Multi-Vehicle Garage & Instant Profile Switcher
- **Single Account, Multiple Vehicles**: Add multiple Two-Wheelers and Four-Wheelers to your personal garage.
- **One-Click Cockpit Switch**: Switch between garage vehicles instantly from **Settings → Garage Fleet** or the Topbar dropdown; telemetry, logs, reminders, and documents re-scope dynamically.
- **Persistence**: Active vehicle selection persists seamlessly across browser sessions.
- **Automatic Checkpoint Provisioning**: Every newly added vehicle automatically provisions 18 standard factory maintenance checkpoints.

### 🎨 High-Fidelity 3D Vehicle Visuals
- **Two-Wheeler Lineup**:
  - *Streetfighter (NS400z)*
  - *Modern Scooter*
  - *Super Sport Bike*
  - *Classic / Cafe Racer*
  - *Heavy Superbike*
  - *Commuter Bike*
- **Four-Wheeler Lineup (Car-Type Based)**:
  - *Executive Sedan* (Notchback Sedan / Saloon)
  - *Sport Hatchback* (Hot Hatch / 5-Door Compact)
  - *Compact SUV / Crossover* (Urban Crossover)
  - *Full-Size SUV* (Rugged 4x4 / Off-Road SUV)
  - *Performance Sports Coupe* (Aero GT / Track Supercar)
  - *Utility Pickup Truck* (Dual-Cab Cargo Bed 4x4)
- **Studio Aesthetics**: High-resolution transparent 3D illustrations rendered against a dark cockpit backdrop with radial lime spotlighting (`#a3e635`).

### 📟 Cockpit Instrument Cluster
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
- **Predictive Health Tracking**: Monitors wear levels for critical components (Engine Oil, Coolant, Chain Lube, Air Filter, Front/Rear Tyres, Battery, Brake Pads, and more) based on factory service intervals.
- **Dynamic Wear Gauges**: Visual progress meters with exact remaining distance before replacement or servicing is due.
- **Service Timeline & Other Repairs**: Unified timeline tracking periodic maintenance, component replacements, and unscheduled repairs with itemized parts and labor costs.

### 📅 Legal Compliance & Document Vault
- **Expiry Countdown Tracker**: Real-time expiry monitoring for Insurance, PUCC, Vehicle Registration, State Tax, Fitness Certificate, and Roadside Assistance (RSA).
- **Status Pills**: Instant color-coded badges for **Active**, **Expiring Soon (< 30 days)**, and **Expired** records.
- **Quick Renewal Logging**: Document number tracking, issuing authority records, and update actions.

### 📑 Comprehensive Themed PDF Reports
- **Instant Client-Side Vector PDF Engine**: Direct file download without external browser print dialogues or bloatware.
- **Flexible Time Horizons**: Default 3-Month filter with instant toggles for 1 Month, 6 Months, 1 Year, or Lifetime history.
- **All-Inclusive Export**: Includes vehicle specifications, odometer telemetry, fuel transaction ledger, maintenance logbook, component health states, and legal document compliance.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) with Custom Dark Cockpit Theme (`#a3e635` Lime Accents) |
| **Routing** | [React Router v7](https://reactrouter.com/) with SPA edge handling |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + GoTrue Auth + Row Level Security) |
| **Icons & Charts** | [Lucide React](https://lucide.dev/) & [Recharts](https://recharts.org/) |
| **PDF Generation** | Pure Client-Side Vector PDF Engine (Embedded Type 1 fonts & vector graphics) |
| **Cloud & Deployment** | [Cloudflare Workers / Static Assets](https://developers.cloudflare.com/workers/) |
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

### 3. Configure Environment
Create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
> *Note: The application operates completely offline with localStorage fallback if Supabase credentials are omitted.*

### 4. Database Setup (Supabase)
Run the SQL migration in `supabase/schema.sql` inside your Supabase project's SQL Editor to set up:
- `vehicles` (Multi-vehicle profile support with `user_id`)
- `fuel_refills`, `maintenance_items`, `service_reminders`, `component_service_logs`, `vehicle_repairs`, `vehicle_documents`, `vehicle_modifications`
- Row-Level Security (RLS) policies for strict tenant isolation.

### 5. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 6. Build for Production
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
