-- MKD Vehicle Management System — Multi-User Cloud Architecture
-- Supports individual user accounts, profiles, and complete data isolation via Supabase Auth & PostgreSQL RLS.
-- Safe to run on a fresh database OR to upgrade existing Supabase tables.

-- 1. Profiles Table (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  bio text,
  preferences jsonb default '{"currency": "₹", "distanceUnit": "km", "fuelUnit": "L"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Vehicles Table
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  vehicle_code text unique not null,
  name text not null,
  brand text not null default 'Honda',
  model text not null default 'Activa 6G',
  category text not null default 'Two Wheeler'
    check (category in ('Two Wheeler', 'Four Wheeler')),
  sub_type text not null default 'Scooter',
  engine_cc integer not null default 110 check (engine_cc > 0),
  plate text not null,
  type text not null default 'Scooter',
  driver text not null default 'Owner',
  status text not null default 'Active'
    check (status in ('Active', 'Maintenance', 'Idle', 'Out of Service')),
  fuel_type text not null default 'Petrol (E10)',
  mileage integer not null default 0 check (mileage >= 0),
  fuel_level integer not null default 100 check (fuel_level between 0 and 100),
  top_speed integer not null default 150 check (top_speed >= 0),
  purchase_date date default '2024-01-15',
  ex_showroom_price numeric default 0,
  last_service date,
  next_service text,
  created_at timestamptz not null default now()
);

-- Upgrade existing public.vehicles table columns
alter table public.vehicles add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.vehicles add column if not exists brand text not null default 'Honda';
alter table public.vehicles add column if not exists model text not null default 'Activa 6G';
alter table public.vehicles add column if not exists category text not null default 'Two Wheeler';
alter table public.vehicles add column if not exists sub_type text not null default 'Scooter';
alter table public.vehicles add column if not exists engine_cc integer not null default 110;
alter table public.vehicles add column if not exists top_speed integer not null default 150;
alter table public.vehicles add column if not exists fuel_type text not null default 'Petrol (E10)';
alter table public.vehicles add column if not exists purchase_date date default '2024-01-15';
alter table public.vehicles add column if not exists ex_showroom_price numeric default 0;

-- Drop global unique plate constraint so different users can enter demo or common plates
alter table public.vehicles drop constraint if exists vehicles_plate_key;

-- 3. Maintenance Logs Table
create table if not exists public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
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
alter table public.maintenance_logs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 4. Monthly Metrics Table
create table if not exists public.monthly_fleet_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  month_label text not null,
  sort_order integer not null,
  mileage integer not null default 0,
  fuel_cost numeric(10, 2) not null default 0,
  maintenance_cost numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);
alter table public.monthly_fleet_metrics add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 5. Fuel Refills Table
create table if not exists public.fuel_refills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
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
alter table public.fuel_refills add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 6. Maintenance Health Items Table (18 wear components)
create table if not exists public.maintenance_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  item_key text not null,
  label text not null,
  interval_km integer not null check (interval_km > 0),
  last_service_odo integer not null default 0 check (last_service_odo >= 0),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint maintenance_items_vehicle_item_unique unique (vehicle_code, item_key)
);
alter table public.maintenance_items add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 7. Component Service Logs
create table if not exists public.component_service_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  item_key text not null,
  service_date date not null default current_date,
  odometer_km integer not null check (odometer_km >= 0),
  cost numeric(10, 2) not null default 0 check (cost >= 0),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.component_service_logs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 8. Vehicle Repairs Table
create table if not exists public.vehicle_repairs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
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
alter table public.vehicle_repairs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 9. Vehicle Documents Table
create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  doc_type text not null,
  title text not null,
  doc_number text,
  issuer text,
  issue_date date,
  expiry_date date not null,
  duration_years numeric(5, 2) default 1,
  max_odometer_km integer,
  amount_paid numeric(10, 2) not null default 0 check (amount_paid >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vehicle_documents add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 10. Service Reminders Table
create table if not exists public.service_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  title text not null,
  service_type text not null default 'Free Service',
  due_date_from date,
  duration_days_min integer,
  duration_days_max integer,
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
alter table public.service_reminders add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 11. Vehicle Modifications Table
create table if not exists public.vehicle_modifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  vehicle_code text not null references public.vehicles(vehicle_code) on delete cascade,
  title text not null,
  category text not null default 'Accessory',
  brand text,
  installed_date date default current_date,
  odometer_km integer check (odometer_km >= 0),
  cost numeric(10, 2) not null default 0 check (cost >= 0),
  installed_by text,
  status text not null default 'Installed' check (status in ('Installed', 'Removed', 'Wishlist')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vehicle_modifications add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Enable Row Level Security on ALL tables
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.monthly_fleet_metrics enable row level security;
alter table public.fuel_refills enable row level security;
alter table public.maintenance_items enable row level security;
alter table public.component_service_logs enable row level security;
alter table public.vehicle_repairs enable row level security;
alter table public.vehicle_documents enable row level security;
alter table public.service_reminders enable row level security;
alter table public.vehicle_modifications enable row level security;

-- Row Level Security Policies
-- Profiles:
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);

-- Vehicles:
drop policy if exists "User vehicles select" on public.vehicles;
create policy "User vehicles select" on public.vehicles for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User vehicles insert" on public.vehicles;
create policy "User vehicles insert" on public.vehicles for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User vehicles update" on public.vehicles;
create policy "User vehicles update" on public.vehicles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User vehicles delete" on public.vehicles;
create policy "User vehicles delete" on public.vehicles for delete to authenticated using ((select auth.uid()) = user_id);

-- Fuel Refills:
drop policy if exists "User fuel select" on public.fuel_refills;
create policy "User fuel select" on public.fuel_refills for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User fuel insert" on public.fuel_refills;
create policy "User fuel insert" on public.fuel_refills for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User fuel update" on public.fuel_refills;
create policy "User fuel update" on public.fuel_refills for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User fuel delete" on public.fuel_refills;
create policy "User fuel delete" on public.fuel_refills for delete to authenticated using ((select auth.uid()) = user_id);

-- Maintenance Items:
drop policy if exists "User maintenance items select" on public.maintenance_items;
create policy "User maintenance items select" on public.maintenance_items for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User maintenance items insert" on public.maintenance_items;
create policy "User maintenance items insert" on public.maintenance_items for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User maintenance items update" on public.maintenance_items;
create policy "User maintenance items update" on public.maintenance_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User maintenance items delete" on public.maintenance_items;
create policy "User maintenance items delete" on public.maintenance_items for delete to authenticated using ((select auth.uid()) = user_id);

-- Maintenance Logs:
drop policy if exists "User maintenance logs select" on public.maintenance_logs;
create policy "User maintenance logs select" on public.maintenance_logs for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User maintenance logs insert" on public.maintenance_logs;
create policy "User maintenance logs insert" on public.maintenance_logs for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User maintenance logs update" on public.maintenance_logs;
create policy "User maintenance logs update" on public.maintenance_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User maintenance logs delete" on public.maintenance_logs;
create policy "User maintenance logs delete" on public.maintenance_logs for delete to authenticated using ((select auth.uid()) = user_id);

-- Monthly Fleet Metrics:
drop policy if exists "User monthly metrics select" on public.monthly_fleet_metrics;
create policy "User monthly metrics select" on public.monthly_fleet_metrics for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User monthly metrics insert" on public.monthly_fleet_metrics;
create policy "User monthly metrics insert" on public.monthly_fleet_metrics for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User monthly metrics update" on public.monthly_fleet_metrics;
create policy "User monthly metrics update" on public.monthly_fleet_metrics for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User monthly metrics delete" on public.monthly_fleet_metrics;
create policy "User monthly metrics delete" on public.monthly_fleet_metrics for delete to authenticated using ((select auth.uid()) = user_id);

-- Component Service Logs:
drop policy if exists "User service logs select" on public.component_service_logs;
create policy "User service logs select" on public.component_service_logs for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User service logs insert" on public.component_service_logs;
create policy "User service logs insert" on public.component_service_logs for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User service logs update" on public.component_service_logs;
create policy "User service logs update" on public.component_service_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User service logs delete" on public.component_service_logs;
create policy "User service logs delete" on public.component_service_logs for delete to authenticated using ((select auth.uid()) = user_id);

-- Vehicle Repairs:
drop policy if exists "User repairs select" on public.vehicle_repairs;
create policy "User repairs select" on public.vehicle_repairs for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User repairs insert" on public.vehicle_repairs;
create policy "User repairs insert" on public.vehicle_repairs for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User repairs update" on public.vehicle_repairs;
create policy "User repairs update" on public.vehicle_repairs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User repairs delete" on public.vehicle_repairs;
create policy "User repairs delete" on public.vehicle_repairs for delete to authenticated using ((select auth.uid()) = user_id);

-- Vehicle Documents:
drop policy if exists "User documents select" on public.vehicle_documents;
create policy "User documents select" on public.vehicle_documents for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User documents insert" on public.vehicle_documents;
create policy "User documents insert" on public.vehicle_documents for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User documents update" on public.vehicle_documents;
create policy "User documents update" on public.vehicle_documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User documents delete" on public.vehicle_documents;
create policy "User documents delete" on public.vehicle_documents for delete to authenticated using ((select auth.uid()) = user_id);

-- Service Reminders:
drop policy if exists "User reminders select" on public.service_reminders;
create policy "User reminders select" on public.service_reminders for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User reminders insert" on public.service_reminders;
create policy "User reminders insert" on public.service_reminders for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User reminders update" on public.service_reminders;
create policy "User reminders update" on public.service_reminders for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User reminders delete" on public.service_reminders;
create policy "User reminders delete" on public.service_reminders for delete to authenticated using ((select auth.uid()) = user_id);

-- Vehicle Modifications:
drop policy if exists "User modifications select" on public.vehicle_modifications;
create policy "User modifications select" on public.vehicle_modifications for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "User modifications insert" on public.vehicle_modifications;
create policy "User modifications insert" on public.vehicle_modifications for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "User modifications update" on public.vehicle_modifications;
create policy "User modifications update" on public.vehicle_modifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "User modifications delete" on public.vehicle_modifications;
create policy "User modifications delete" on public.vehicle_modifications for delete to authenticated using ((select auth.uid()) = user_id);

-- Indexes for lightning fast user-isolated queries:
create index if not exists idx_vehicles_user_id on public.vehicles (user_id);
create index if not exists idx_fuel_refills_user_id on public.fuel_refills (user_id);
create index if not exists idx_maintenance_items_user_id on public.maintenance_items (user_id);
create index if not exists idx_component_service_logs_user_id on public.component_service_logs (user_id);
create index if not exists idx_vehicle_repairs_user_id on public.vehicle_repairs (user_id);
create index if not exists idx_vehicle_documents_user_id on public.vehicle_documents (user_id);
create index if not exists idx_service_reminders_user_id on public.service_reminders (user_id);
create index if not exists idx_maintenance_logs_user_id on public.maintenance_logs (user_id);
create index if not exists idx_monthly_fleet_metrics_user_id on public.monthly_fleet_metrics (user_id);
create index if not exists idx_vehicle_modifications_user_id on public.vehicle_modifications (user_id);

-- Permissions for authenticated users:
grant all on public.profiles to authenticated, service_role;
grant all on public.vehicles to authenticated, service_role;
grant all on public.maintenance_logs to authenticated, service_role;
grant all on public.monthly_fleet_metrics to authenticated, service_role;
grant all on public.fuel_refills to authenticated, service_role;
grant all on public.maintenance_items to authenticated, service_role;
grant all on public.component_service_logs to authenticated, service_role;
grant all on public.vehicle_repairs to authenticated, service_role;
grant all on public.vehicle_documents to authenticated, service_role;
grant all on public.service_reminders to authenticated, service_role;
grant all on public.vehicle_modifications to authenticated, service_role;

-- Reload schema cache
notify pgrst, 'reload schema';
