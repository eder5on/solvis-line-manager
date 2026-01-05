-- Supabase schema for Solvis Line Manager
-- Operators
create table if not exists operators (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  created_at timestamptz default now()
);

-- Units
create table if not exists units (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Lines
create table if not exists lines (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  operator_real text not null,
  operator_current text not null,
  client_id uuid references clients(id),
  unit_id uuid references units(id),
  monthly_cost numeric,
  status text default 'Ativa',
  last_movement_at timestamptz,
  created_at timestamptz default now()
);

-- Invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  line_id uuid references lines(id) on delete cascade,
  file_path text not null,
  amount numeric,
  uploaded_at timestamptz default now()
);

-- Line movements
create table if not exists line_movements (
  id uuid primary key default gen_random_uuid(),
  line_id uuid references lines(id) on delete cascade,
  type text not null,
  user_id uuid,
  notes text,
  created_at timestamptz default now()
);

-- Cancel criteria
create table if not exists cancel_criteria (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  field text not null,
  operator text not null,
  value text not null,
  priority int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Cancel evaluation
create table if not exists cancel_evaluation (
  id uuid primary key default gen_random_uuid(),
  line_id uuid references lines(id) on delete cascade,
  criteria_id uuid references cancel_criteria(id) on delete cascade,
  matched boolean default false,
  evaluated_at timestamptz default now()
);

-- Requests (solicitations)
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  line_id uuid references lines(id),
  type text not null,
  notes text,
  created_by uuid,
  status text default 'Pendente',
  created_at timestamptz default now()
);

-- Users (application profiles linked to Supabase Auth users)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  email text,
  full_name text,
  role text default 'user', -- 'master_admin' | 'user'
  created_at timestamptz default now()
);

-- NOTE: Recommended RLS and policies to add manually in Supabase for production:
-- enable row level security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Policy: allow select/update for master_admins only (server-side enforcement recommended)
-- CREATE POLICY "master_admins_manage_users" ON public.users
-- FOR ALL USING ( (exists (select 1 from public.users u2 where u2.user_id = auth.uid() and u2.role = 'master_admin')) );
