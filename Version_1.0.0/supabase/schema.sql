-- FleetCore Vehicle Management System — Single-Vehicle Schema (Two Wheeler & Four Wheeler)
-- Safe to run on a fresh database OR to upgrade your existing Supabase tables.
-- Run this in Supabase Dashboard -> SQL Editor -> New query.

-- 1. Vehicles table (create if missing)
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  vehicle_code text unique not null,
  name text not null,
  brand text not null default 'Honda',
  model text not null default 'Activa 6G',
  category text not null default 'Two Wheeler'
    check (category in ('Two Wheeler', 'Four Wheeler')),
  sub_type text not null default 'Scooter'
    check (sub_type in ('Scooter', 'Bike', 'Car')),
  engine_cc integer not null default 110 check (engine_cc > 0),
  plate text unique not null,
  type text not null default 'Scooter',
  driver text not null default 'Owner',
  status text not null default 'Active'
    check (status in ('Active', 'Maintenance', 'Idle', 'Out of Service')),
  mileage integer not null default 0 check (mileage >= 0),
  fuel_level integer not null default 100 check (fuel_level between 0 and 100),
  top_speed integer not null default 150 check (top_speed >= 0),
  last_service date,
  next_service text,
  created_at timestamptz not null default now()
);

-- Upgrade existing public.vehicles table if created with the earlier schema
alter table public.vehicles add column if not exists brand text not null default 'Honda';
alter table public.vehicles add column if not exists model text not null default 'Activa 6G';
alter table public.vehicles add column if not exists category text not null default 'Two Wheeler';
alter table public.vehicles add column if not exists sub_type text not null default 'Scooter';
alter table public.vehicles add column if not exists engine_cc integer not null default 110;
alter table public.vehicles add column if not exists top_speed integer not null default 150;

-- Enforce only 2 categories: Two Wheeler & Four Wheeler
alter table public.vehicles drop constraint if exists vehicles_category_check;
alter table public.vehicles
  add constraint vehicles_category_check
  check (category in ('Two Wheeler', 'Four Wheeler'));

alter table public.vehicles drop constraint if exists vehicles_sub_type_check;
alter table public.vehicles
  add constraint vehicles_sub_type_check
  check (sub_type in ('Scooter', 'Bike', 'Car'));

-- 2. Maintenance logs table
create table if not exists public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  work_order_code text unique not null,
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  vehicle_name text not null,
  service_type text not null,
  due_date date not null,
  estimated_cost numeric(10, 2) not null default 0 check (estimated_cost >= 0),
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'Scheduled'
    check (status in ('Scheduled', 'In Progress', 'Completed', 'Overdue')),
  created_at timestamptz not null default now()
);

-- 3. Monthly metrics table
create table if not exists public.monthly_fleet_metrics (
  id uuid primary key default gen_random_uuid(),
  month_label text unique not null,
  sort_order integer not null,
  mileage integer not null default 0,
  fuel_cost numeric(10, 2) not null default 0,
  maintenance_cost numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.vehicles enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.monthly_fleet_metrics enable row level security;

-- Starter development policies (tighten once Supabase Auth is enabled)
drop policy if exists "Allow public read vehicles" on public.vehicles;
create policy "Allow public read vehicles"
  on public.vehicles for select
  using (true);

drop policy if exists "Allow public insert vehicles" on public.vehicles;
create policy "Allow public insert vehicles"
  on public.vehicles for insert
  with check (true);

drop policy if exists "Allow public update vehicles" on public.vehicles;
create policy "Allow public update vehicles"
  on public.vehicles for update
  using (true);

drop policy if exists "Allow public delete vehicles" on public.vehicles;
create policy "Allow public delete vehicles"
  on public.vehicles for delete
  using (true);

drop policy if exists "Allow public read maintenance_logs" on public.maintenance_logs;
create policy "Allow public read maintenance_logs"
  on public.maintenance_logs for select
  using (true);

drop policy if exists "Allow public insert maintenance_logs" on public.maintenance_logs;
create policy "Allow public insert maintenance_logs"
  on public.maintenance_logs for insert
  with check (true);

drop policy if exists "Allow public read monthly_fleet_metrics" on public.monthly_fleet_metrics;
create policy "Allow public read monthly_fleet_metrics"
  on public.monthly_fleet_metrics for select
  using (true);

-- Keep just 1 starter vehicle for now
delete from public.maintenance_logs;
delete from public.vehicles;

insert into public.vehicles
  (vehicle_code, name, brand, model, category, sub_type, engine_cc, plate, type, driver, status, mileage, fuel_level, last_service, next_service)
values
  ('VH-001', 'City Glide', 'Honda', 'Activa 6G', 'Two Wheeler', 'Scooter', 110, 'MH-12-AB-4021', 'Scooter', 'Owner', 'Active', 8450, 78, '2026-10-12', '2026-12-15')
on conflict (vehicle_code) do update set
  name = excluded.name,
  brand = excluded.brand,
  model = excluded.model,
  category = excluded.category,
  sub_type = excluded.sub_type,
  engine_cc = excluded.engine_cc,
  plate = excluded.plate,
  type = excluded.type,
  status = excluded.status,
  mileage = excluded.mileage,
  fuel_level = excluded.fuel_level;

-- Seed maintenance schedule for the 1 vehicle
insert into public.maintenance_logs
  (work_order_code, vehicle_code, vehicle_name, service_type, due_date, estimated_cost, priority, status)
values
  ('MNT-101', 'VH-001', 'Honda Activa 6G', 'Engine Oil Change & Brake Inspection', '2026-12-15', 45, 'Medium', 'Scheduled'),
  ('MNT-102', 'VH-001', 'Honda Activa 6G', 'Air Filter & Tire Pressure Check', '2027-01-20', 25, 'Low', 'Scheduled')
on conflict (work_order_code) do nothing;

-- Seed monthly metrics for the 1 vehicle
delete from public.monthly_fleet_metrics;
insert into public.monthly_fleet_metrics
  (month_label, sort_order, mileage, fuel_cost, maintenance_cost)
values
  ('Jan', 1, 480, 52, 0),
  ('Feb', 2, 510, 56, 35),
  ('Mar', 3, 590, 64, 0),
  ('Apr', 4, 540, 59, 20),
  ('May', 5, 605, 66, 0),
  ('Jun', 6, 620, 68, 45)
on conflict (month_label) do nothing;

-- 4. Fuel refills table (tracks refills, spend, stations, fill type, and odometer sync)
create table if not exists public.fuel_refills (
  id uuid primary key default gen_random_uuid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  refill_date date not null default current_date,
  odometer_km integer not null check (odometer_km >= 0),
  liters numeric(10, 2) not null check (liters > 0),
  price_per_liter numeric(10, 2) check (price_per_liter > 0),
  amount_spent numeric(10, 2) not null check (amount_spent >= 0),
  fuel_level_after integer not null default 100 check (fuel_level_after between 0 and 100),
  fuel_fill_type text default 'Full Tank' check (fuel_fill_type in ('Full Tank', 'Partial / Reserve')),
  station_name text default 'Fuel Station',
  location text,
  notes text,
  created_at timestamptz not null default now()
);

-- Upgrade existing fuel_refills table if created earlier
alter table public.fuel_refills add column if not exists price_per_liter numeric(10, 2);
alter table public.fuel_refills add column if not exists fuel_fill_type text default 'Full Tank';
alter table public.fuel_refills add column if not exists station_name text default 'Fuel Station';
alter table public.fuel_refills add column if not exists location text;

alter table public.fuel_refills drop constraint if exists fuel_refills_fill_type_check;
alter table public.fuel_refills
  add constraint fuel_refills_fill_type_check
  check (fuel_fill_type in ('Full Tank', 'Partial / Reserve'));

create index if not exists idx_fuel_refills_vehicle_recent
  on public.fuel_refills (vehicle_code, refill_date desc, created_at desc);

-- 5. Maintenance health items table (9 core wear components vs odometer)
create table if not exists public.maintenance_items (
  id uuid primary key default gen_random_uuid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  item_key text not null,
  label text not null,
  interval_km integer not null check (interval_km > 0),
  last_service_odo integer not null default 0 check (last_service_odo >= 0),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint maintenance_items_vehicle_item_unique unique (vehicle_code, item_key)
);

create index if not exists idx_maintenance_items_vehicle_order
  on public.maintenance_items (vehicle_code, sort_order asc);

-- Row Level Security policies for fuel_refills and maintenance_items
alter table public.fuel_refills enable row level security;
alter table public.maintenance_items enable row level security;

drop policy if exists "Allow public read fuel_refills" on public.fuel_refills;
create policy "Allow public read fuel_refills" on public.fuel_refills for select using (true);

drop policy if exists "Allow public insert fuel_refills" on public.fuel_refills;
create policy "Allow public insert fuel_refills" on public.fuel_refills for insert with check (true);

drop policy if exists "Allow public update fuel_refills" on public.fuel_refills;
create policy "Allow public update fuel_refills" on public.fuel_refills for update using (true);

drop policy if exists "Allow public delete fuel_refills" on public.fuel_refills;
create policy "Allow public delete fuel_refills" on public.fuel_refills for delete using (true);

drop policy if exists "Allow public read maintenance_items" on public.maintenance_items;
create policy "Allow public read maintenance_items" on public.maintenance_items for select using (true);

drop policy if exists "Allow public update maintenance_items" on public.maintenance_items;
create policy "Allow public update maintenance_items" on public.maintenance_items for update using (true);

-- Refresh PostgREST schema cache so new columns are available immediately
notify pgrst, 'reload schema';
