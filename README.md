# MKD — Mobility Keeper Digital 🚗🏍️

![MKD Logo](Version_1.0.0/public/logo-transparent.png)

> **MKD (Mobility Keeper — Digital)** is a modern, high-performance vehicle telemetry, fuel consumption analytics, and preventive maintenance tracking application built for motorcycles and cars.

---

## ✨ Features

- **🏎️ Cockpit Instrument Cluster**: Real-time animated TFT speedometer with dynamic multi-tier speed lighting (`0-60` Eco Green, `60-120` Power Orange, `120+` Redline), dynamic gear shifting indicator ($N \to 1..6$), cascading LED tachometer rev-band, and mechanical rolling digit odometer tumbler.
- **⛽ Fuel Ledger & Consumption Analytics**:
  - **Top-Up to Top-Up Fuel Efficiency**: Calculates real-world mileage (`km/L`), fuel consumption rates (`L/100km`), and running cost per km (`₹/km`) between consecutive fill-ups.
  - **Cumulative All-Time Tracking**: Measures total distance traveled and overall average consumption from the very first fuel entry baseline.
  - **3-Way Interactive Fuel Calculator**: Real-time sync between liters, price per liter, and amount spent.
  - **Monthly Refill Comparison**: Current month expense and quantity compared against previous month benchmark.
- **🛠️ Preventive Maintenance & Component Health**:
  - Component wear tracking against factory service intervals: Engine Oil, Coolant, Chain Lube, Air Filter, Front/Rear Tyres, Battery, and Front/Rear Brakes.
  - Visual status progress bars with dynamic remaining distance calculations.
  - Inline service reset logging directly updating maintenance history.
- **🏍️ Dynamic 3D Vehicle Illustrations**:
  - Transparent 3D vehicle visualizer supporting Streetfighters (NS400z), Modern Scooters, Super Sport Bikes, Cafe Racers/Cruisers, and Heavy Superbikes with dark studio lighting.
- **⚡ Live Supabase Integration**:
  - Instant cloud synchronization for vehicles, fuel refills, and maintenance schedules with declarative PostgreSQL schema migrations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts
- **Database & Backend**: Supabase (PostgreSQL with Row Level Security & schema triggers)
- **Tooling**: Oxlint, React Router v7

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Mubashir12-a/VehicleManagement.git
cd VehicleManagement/Version_1.0.0
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file inside `Version_1.0.0/`:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```

---

## 📄 License
MIT License. Developed with ❤️ for vehicle enthusiasts and fleet managers.
