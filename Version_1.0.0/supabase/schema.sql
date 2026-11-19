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
  fuel_type text not null default 'Petrol (E10)',
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
alter table public.vehicles add column if not exists fuel_type text not null default 'Petrol (E10)';

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

-- 5. Maintenance health items table (18 wear components vs odometer)
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

-- 6. Component service logs (individual replacement / service logs for each component)
create table if not exists public.component_service_logs (
  id uuid primary key default gen_random_uuid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  item_key text not null,
  service_date date not null default current_date,
  odometer_km integer not null check (odometer_km >= 0),
  cost numeric(10, 2) not null default 0 check (cost >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_component_service_logs_vehicle_item
  on public.component_service_logs (vehicle_code, item_key, service_date desc, created_at desc);

-- 7. Other repairs & custom replacements table (ad-hoc jobs with cost, odo, and details)
create table if not exists public.vehicle_repairs (
  id uuid primary key default gen_random_uuid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  repair_title text not null,
  category text not null default 'Repair',
  repair_date date not null default current_date,
  odometer_km integer not null check (odometer_km >= 0),
  cost numeric(10, 2) not null default 0 check (cost >= 0),
  garage_name text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicle_repairs_vehicle_date
  on public.vehicle_repairs (vehicle_code, repair_date desc, created_at desc);

-- Row Level Security policies
alter table public.fuel_refills enable row level security;
alter table public.maintenance_items enable row level security;
alter table public.component_service_logs enable row level security;
alter table public.vehicle_repairs enable row level security;

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

drop policy if exists "Allow public insert maintenance_items" on public.maintenance_items;
create policy "Allow public insert maintenance_items" on public.maintenance_items for insert with check (true);

drop policy if exists "Allow public update maintenance_items" on public.maintenance_items;
create policy "Allow public update maintenance_items" on public.maintenance_items for update using (true);

drop policy if exists "Allow public read component_service_logs" on public.component_service_logs;
create policy "Allow public read component_service_logs" on public.component_service_logs for select using (true);

drop policy if exists "Allow public insert component_service_logs" on public.component_service_logs;
create policy "Allow public insert component_service_logs" on public.component_service_logs for insert with check (true);

drop policy if exists "Allow public update component_service_logs" on public.component_service_logs;
create policy "Allow public update component_service_logs" on public.component_service_logs for update using (true);

drop policy if exists "Allow public delete component_service_logs" on public.component_service_logs;
create policy "Allow public delete component_service_logs" on public.component_service_logs for delete using (true);

drop policy if exists "Allow public read vehicle_repairs" on public.vehicle_repairs;
create policy "Allow public read vehicle_repairs" on public.vehicle_repairs for select using (true);

drop policy if exists "Allow public insert vehicle_repairs" on public.vehicle_repairs;
create policy "Allow public insert vehicle_repairs" on public.vehicle_repairs for insert with check (true);

drop policy if exists "Allow public update vehicle_repairs" on public.vehicle_repairs;
create policy "Allow public update vehicle_repairs" on public.vehicle_repairs for update using (true);

drop policy if exists "Allow public delete vehicle_repairs" on public.vehicle_repairs;
create policy "Allow public delete vehicle_repairs" on public.vehicle_repairs for delete using (true);

-- Seed/sync 18 comprehensive maintenance components
insert into public.maintenance_items (vehicle_code, item_key, label, interval_km, last_service_odo, sort_order)
values
  ('VH-001', 'engine_oil', 'Engine Oil', 3000, 0, 1),
  ('VH-001', 'chain_lube', 'Chain Lube', 500, 0, 2),
  ('VH-001', 'air_filter', 'Air Filter', 6000, 0, 3),
  ('VH-001', 'front_tyre', 'Front Tyre Health', 20000, 0, 4),
  ('VH-001', 'rear_tyre', 'Rear Tyre Health', 15000, 0, 5),
  ('VH-001', 'battery', 'Battery Health', 25000, 0, 6),
  ('VH-001', 'brake_front', 'Brake Pads Front', 10000, 0, 7),
  ('VH-001', 'brake_rear', 'Brake Pads Rear', 10000, 0, 8),
  ('VH-001', 'clutch_plate', 'Clutch Plate', 25000, 0, 9),
  ('VH-001', 'spark_plug', 'Spark Plug', 12000, 0, 10),
  ('VH-001', 'coolant', 'Coolant', 15000, 0, 11),
  ('VH-001', 'chain_replacement', 'Chain Replacement', 20000, 0, 12),
  ('VH-001', 'sprocket_replacement', 'Sprocket Replacement', 20000, 0, 13),
  ('VH-001', 'brake_fluid_front', 'Brake Fluid Front', 15000, 0, 14),
  ('VH-001', 'brake_fluid_rear', 'Brake Fluid Rear', 15000, 0, 15),
  ('VH-001', 'fork_oil_front', 'Front Fork Oil Replace', 15000, 0, 16),
  ('VH-001', 'rear_suspension', 'Rear Suspension Replace', 30000, 0, 17),
  ('VH-001', 'washing', 'Washing & Detailing', 500, 0, 18)
on conflict (vehicle_code, item_key) do update set
  label = excluded.label,
  interval_km = excluded.interval_km,
  sort_order = excluded.sort_order;

-- 8. Vehicle documents table (Insurance, RC, PUC, Warranty expiry tracking)
create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  doc_type text not null,
  title text not null,
  doc_number text,
  issuer text,
  issue_date date,
  expiry_date date not null,
  max_odometer_km integer,
  amount_paid numeric(10, 2) not null default 0 check (amount_paid >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vehicle_documents_vehicle_expiry 
  on public.vehicle_documents (vehicle_code, expiry_date asc);

-- 9. Service reminders table (user-entered free & paid inspection intervals & completion logs)
create table if not exists public.service_reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  title text not null,
  service_type text not null default 'Free Service',
  due_date date,
  due_date_end date,
  due_odometer_km integer,
  due_odometer_max_km integer,
  status text not null default 'Pending' check (status in ('Pending', 'Completed')),
  completed_date date,
  completed_odometer_km integer,
  amount_paid numeric(10, 2) not null default 0 check (amount_paid >= 0),
  service_center text,
  invoice_no text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_reminders_vehicle_status 
  on public.service_reminders (vehicle_code, status, due_date asc);

-- Permissions for vehicle_documents and service_reminders
grant all on public.vehicle_documents to anon, authenticated, service_role;
grant all on public.service_reminders to anon, authenticated, service_role;

-- Refresh PostgREST schema cache so new columns and tables are available immediately
notify pgrst, 'reload schema';
